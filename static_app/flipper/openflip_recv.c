/*
 * OpenFlip Receiver – Flipper Zero visualization
 *
 * Phases:
 *   1. Connecting   – waiting for phone handshake
 *   2. Receiving     – progress bar, module download over BLE
 *   3. Installing    – brief flash while module loads
 *   4. Executing     – signal-wave animation, attack in progress
 *   5. Complete      – checkmark, done
 *
 * Build with ufbt:
 *   ufbt build
 *   ufbt install        (Flipper connected via USB)
 */

#include <furi.h>
#include <gui/gui.h>
#include <input/input.h>
#include <loader/loader.h>
#include <notification/notification.h>
#include <notification/notification_messages.h>
#include <stdio.h>

/* Path to BLE Spam FAP on Unleashed firmware SD card */
#define BLE_SPAM_PATH "/ext/apps/Bluetooth/ble_spam.fap"

/* ─── Timing (50 ms per tick ≈ 20 fps) ──────────────────────── */
#define TICK_MS        50
#define CONNECT_TICKS  50   /* 2.5 s  */
#define INSTALL_TICKS  30   /* 1.5 s  */
#define EXECUTE_TICKS  80   /* 4.0 s  */
#define RECV_DONE_WAIT 15   /* 0.75 s pause after bar fills */

/* ─── Module database (mirrors phone app) ───────────────────── */
#define MOD_COUNT 1

static const char* mod_fap[MOD_COUNT] = {
    "ble_spam_ios.fap",
};

static const char* mod_size[MOD_COUNT] = {
    "12.6 KB",
};

static const char* mod_atk[MOD_COUNT] = {
    "BLE Spam Flood",
};

static const char* mod_tgt[MOD_COUNT] = {
    "iPhone 16",
};

/* ─── Phase enum ────────────────────────────────────────────── */
typedef enum {
    PhaseConnect,
    PhaseReceive,
    PhaseInstall,
    PhaseExecute,
    PhaseComplete,
    PhaseLaunch,   /* brief "Launching BLE Spam..." before chaining */
} Phase;

/* ─── App state ─────────────────────────────────────────────── */
typedef struct {
    Phase    phase;
    int16_t  progress;    /* 0 … 100 */
    uint16_t tick;
    uint16_t phase_tick;
    uint8_t  wait;        /* transition delay counter */
    uint8_t  mod;         /* index into module tables */
    bool     running;
    bool     launch_ble;  /* flag: chain into BLE Spam on exit */
    FuriMutex* mutex;
} App;

/* ─── Draw callback (called from GUI thread) ────────────────── */
static void draw_cb(Canvas* canvas, void* ctx) {
    App* app = ctx;
    furi_mutex_acquire(app->mutex, FuriWaitForever);

    canvas_clear(canvas);

    /* ── Header bar ── */
    canvas_set_font(canvas, FontPrimary);
    canvas_draw_str(canvas, 2, 10, "OPENFLIP");

    /* Status dot – blinks during connect / execute */
    bool show_dot = true;
    if(app->phase == PhaseConnect || app->phase == PhaseExecute)
        show_dot = (app->phase_tick / 5) % 2 == 0;
    if(show_dot) canvas_draw_disc(canvas, 123, 5, 2);

    canvas_draw_line(canvas, 0, 13, 127, 13);

    char buf[48];
    uint8_t m = app->mod;

    switch(app->phase) {

    /* ── CONNECTING ───────────────────────────────────────── */
    case PhaseConnect: {
        int dots = (app->phase_tick / 8) % 4;
        snprintf(buf, sizeof(buf), "Connecting%.*s", dots, "...");
        canvas_set_font(canvas, FontSecondary);
        canvas_draw_str_aligned(
            canvas, 64, 27, AlignCenter, AlignCenter, buf);

        /* Rotating-dot spinner */
        int cx = 64, cy = 40;
        int frame = (app->phase_tick / 4) % 4;
        static const int8_t sx[] = {-5, 5, 5, -5};
        static const int8_t sy[] = {-4, -4, 4, 4};
        for(int i = 0; i < 4; i++) {
            if(i == frame)
                canvas_draw_disc(canvas, cx + sx[i], cy + sy[i], 2);
            else
                canvas_draw_circle(canvas, cx + sx[i], cy + sy[i], 1);
        }

        canvas_draw_str_aligned(
            canvas, 64, 56, AlignCenter, AlignCenter,
            "Waiting for phone...");
        break;
    }

    /* ── RECEIVING ────────────────────────────────────────── */
    case PhaseReceive: {
        canvas_set_font(canvas, FontSecondary);

        int dots = (app->phase_tick / 6) % 4;
        snprintf(buf, sizeof(buf), "Receiving module%.*s", dots, "...");
        canvas_draw_str(canvas, 2, 25, buf);

        /* Module filename */
        canvas_draw_str(canvas, 2, 35, mod_fap[m]);

        /* Progress bar (rounded) */
        canvas_draw_rframe(canvas, 2, 39, 124, 10, 2);
        int w = (int)app->progress * 120 / 100;
        if(w > 0) canvas_draw_rbox(canvas, 4, 41, w, 6, 1);

        /* Percent + total size */
        snprintf(buf, sizeof(buf), "%d%%   %s", app->progress, mod_size[m]);
        canvas_draw_str(canvas, 2, 59, buf);
        break;
    }

    /* ── INSTALLING ───────────────────────────────────────── */
    case PhaseInstall: {
        canvas_set_font(canvas, FontSecondary);

        int dots = (app->phase_tick / 5) % 4;
        snprintf(buf, sizeof(buf), "Installing module%.*s", dots, "...");
        canvas_draw_str_aligned(
            canvas, 64, 26, AlignCenter, AlignCenter, buf);

        canvas_draw_str_aligned(
            canvas, 64, 37, AlignCenter, AlignCenter, mod_fap[m]);

        /* Full progress bar */
        canvas_draw_rframe(canvas, 14, 43, 100, 8, 2);
        canvas_draw_rbox(canvas, 16, 45, 96, 4, 1);
        break;
    }

    /* ── EXECUTING ATTACK ─────────────────────────────────── */
    case PhaseExecute: {
        canvas_set_font(canvas, FontPrimary);
        canvas_draw_str_aligned(
            canvas, 64, 22, AlignCenter, AlignCenter,
            "EXECUTING ATTACK");

        canvas_set_font(canvas, FontSecondary);
        snprintf(buf, sizeof(buf), "%s > %s", mod_atk[m], mod_tgt[m]);
        canvas_draw_str_aligned(
            canvas, 64, 33, AlignCenter, AlignCenter, buf);

        /* Signal-wave animation: expanding concentric rings */
        int cx = 64, cy = 50;
        canvas_draw_disc(canvas, cx, cy, 3); /* emitter dot */

        for(int i = 0; i < 3; i++) {
            int r = ((app->phase_tick * 2 + i * 10) % 30) + 4;
            canvas_draw_circle(canvas, cx, cy, r);
        }
        break;
    }

    /* ── COMPLETE ─────────────────────────────────────────── */
    case PhaseComplete: {
        /* Checkmark inside a circle */
        int cx = 64, cy = 28;
        canvas_draw_circle(canvas, cx, cy, 11);
        /* Thick check (two offset lines per stroke) */
        canvas_draw_line(canvas, cx - 6, cy,     cx - 2, cy + 4);
        canvas_draw_line(canvas, cx - 6, cy + 1, cx - 2, cy + 5);
        canvas_draw_line(canvas, cx - 2, cy + 4, cx + 7, cy - 5);
        canvas_draw_line(canvas, cx - 2, cy + 5, cx + 7, cy - 4);

        canvas_set_font(canvas, FontPrimary);
        canvas_draw_str_aligned(
            canvas, 64, 48, AlignCenter, AlignCenter,
            "MODULE READY");

        canvas_set_font(canvas, FontSecondary);
        canvas_draw_str_aligned(
            canvas, 64, 60, AlignCenter, AlignCenter,
            "[OK] BLE Attack  [<] Exit");
        break;
    }

    /* ── LAUNCHING BLE SPAM ───────────────────────────────── */
    case PhaseLaunch: {
        canvas_set_font(canvas, FontSecondary);

        int dots = (app->phase_tick / 5) % 4;
        snprintf(buf, sizeof(buf), "Launching BLE Spam%.*s", dots, "...");
        canvas_draw_str_aligned(
            canvas, 64, 32, AlignCenter, AlignCenter, buf);

        /* Signal burst animation */
        int cx = 64, cy = 48;
        canvas_draw_disc(canvas, cx, cy, 2);
        for(int i = 0; i < 3; i++) {
            int r = ((app->phase_tick * 3 + i * 8) % 24) + 3;
            canvas_draw_circle(canvas, cx, cy, r);
        }
        break;
    }
    }

    furi_mutex_release(app->mutex);
}

/* ─── Input callback (queues events for main loop) ──────────── */
static void input_cb(InputEvent* event, void* ctx) {
    FuriMessageQueue* queue = ctx;
    furi_message_queue_put(queue, event, FuriWaitForever);
}

/* ─── Entry point ───────────────────────────────────────────── */
int32_t openflip_recv_app(void* p) {
    UNUSED(p);

    App app = {
        .phase      = PhaseConnect,
        .progress   = 0,
        .tick       = 0,
        .phase_tick = 0,
        .wait       = 0,
        .mod        = (uint8_t)(furi_get_tick() % MOD_COUNT),
        .running    = true,
        .launch_ble = false,
    };

    app.mutex = furi_mutex_alloc(FuriMutexTypeNormal);

    FuriMessageQueue* queue =
        furi_message_queue_alloc(8, sizeof(InputEvent));

    ViewPort* vp = view_port_alloc();
    view_port_draw_callback_set(vp, draw_cb, &app);
    view_port_input_callback_set(vp, input_cb, queue);

    Gui* gui = furi_record_open(RECORD_GUI);
    gui_add_view_port(gui, vp, GuiLayerFullscreen);

    NotificationApp* notif = furi_record_open(RECORD_NOTIFICATION);

    /* ── Main loop ── */
    while(app.running) {
        InputEvent event;
        FuriStatus status =
            furi_message_queue_get(queue, &event, TICK_MS);

        /* ── Handle input ── */
        if(status == FuriStatusOk && event.type == InputTypePress) {
            if(event.key == InputKeyBack) {
                app.running = false;
                continue;
            }
            if(event.key == InputKeyOk &&
               app.phase == PhaseComplete) {
                /* Transition to launch phase → chain into BLE Spam */
                furi_mutex_acquire(app.mutex, FuriWaitForever);
                app.phase      = PhaseLaunch;
                app.phase_tick = 0;
                furi_mutex_release(app.mutex);
            }
        }

        /* ── Advance state ── */
        furi_mutex_acquire(app.mutex, FuriWaitForever);
        app.tick++;
        app.phase_tick++;

        switch(app.phase) {

        case PhaseConnect:
            if(app.phase_tick >= CONNECT_TICKS) {
                app.phase      = PhaseReceive;
                app.phase_tick = 0;
                notification_message(notif, &sequence_blink_blue_100);
            }
            break;

        case PhaseReceive:
            if(app.progress < 100) {
                app.progress++;
                /* Extra bump every 3rd tick → avg 1.33/tick ≈ 3.75 s */
                if(app.phase_tick % 3 == 0) app.progress++;
                if(app.progress > 100) app.progress = 100;
            } else {
                app.wait++;
                if(app.wait >= RECV_DONE_WAIT) {
                    app.phase      = PhaseInstall;
                    app.phase_tick = 0;
                    app.wait       = 0;
                }
            }
            if(app.phase_tick % 10 == 0)
                notification_message(notif, &sequence_blink_blue_10);
            break;

        case PhaseInstall:
            if(app.phase_tick >= INSTALL_TICKS) {
                app.phase      = PhaseExecute;
                app.phase_tick = 0;
                notification_message(notif, &sequence_single_vibro);
            }
            break;

        case PhaseExecute:
            if(app.phase_tick >= EXECUTE_TICKS) {
                app.phase      = PhaseComplete;
                app.phase_tick = 0;
                notification_message(notif, &sequence_success);
            }
            if(app.phase_tick % 6 == 0)
                notification_message(notif, &sequence_blink_red_10);
            break;

        case PhaseComplete:
            break;

        case PhaseLaunch:
            /* Show animation briefly, then enqueue BLE Spam and exit */
            if(app.phase_tick >= 30) { /* 1.5 s */
                app.launch_ble = true;
                app.running    = false;
            }
            if(app.phase_tick % 4 == 0)
                notification_message(notif, &sequence_blink_red_10);
            break;
        }

        furi_mutex_release(app.mutex);
        view_port_update(vp);
    }

    /* ── Cleanup ── */
    gui_remove_view_port(gui, vp);
    furi_record_close(RECORD_GUI);
    furi_record_close(RECORD_NOTIFICATION);
    view_port_free(vp);
    furi_message_queue_free(queue);
    furi_mutex_free(app.mutex);

    /* ── Chain into BLE Spam if requested ── */
    if(app.launch_ble) {
        Loader* loader = furi_record_open(RECORD_LOADER);
        loader_start_with_gui_error(loader, BLE_SPAM_PATH, NULL);
        furi_record_close(RECORD_LOADER);
    }

    return 0;
}
