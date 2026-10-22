use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{
    AppHandle, Emitter, LogicalPosition, LogicalSize, Manager, WebviewBuilder,
    WebviewUrl, Window,
};

const CHROME_HEIGHT: f64 = 88.0;

struct TabRegistry(Mutex<HashMap<String, bool>>);

fn get_window(app: &AppHandle) -> Window {
    app.get_window("main").expect("main window not found")
}

fn tab_url(url: &str) -> WebviewUrl {
    if url == "jeh://newtab" || url.is_empty() {
        WebviewUrl::App("newtab".into())
    } else {
        WebviewUrl::External(url.parse().unwrap_or_else(|_| {
            format!("https://search.brave.com/search?q={}", urlencoding(url))
                .parse()
                .unwrap()
        }))
    }
}

fn urlencoding(s: &str) -> String {
    s.chars().map(|c| {
        if c.is_alphanumeric() || "-_.~".contains(c) { c.to_string() }
        else { format!("%{:02X}", c as u32) }
    }).collect()
}

#[tauri::command]
fn create_tab(app: AppHandle, id: String, url: String) -> Result<(), String> {
    let win = get_window(&app);
    let size = win.inner_size().map_err(|e| e.to_string())?;
    let w = size.width as f64;
    let h = size.height as f64;

    let webview = WebviewBuilder::new(&id, tab_url(&url))
        .auto_resize();

    win.add_child(
        webview,
        LogicalPosition::new(0.0, CHROME_HEIGHT),
        LogicalSize::new(w, h - CHROME_HEIGHT),
    ).map_err(|e| e.to_string())?;

    let reg = app.state::<TabRegistry>();
    reg.0.lock().unwrap().insert(id.clone(), true);

    // Hide all other tabs, show this one
    let ids: Vec<String> = reg.0.lock().unwrap().keys().cloned().collect();
    for tid in &ids {
        if let Some(wv) = win.get_webview(tid) {
            if tid == &id { let _ = wv.show(); }
            else { let _ = wv.hide(); }
        }
    }

    Ok(())
}

#[tauri::command]
fn activate_tab(app: AppHandle, id: String) -> Result<(), String> {
    let win = get_window(&app);
    let reg = app.state::<TabRegistry>();
    let ids: Vec<String> = reg.0.lock().unwrap().keys().cloned().collect();

    for tid in &ids {
        if let Some(wv) = win.get_webview(tid) {
            if tid == &id { let _ = wv.show(); }
            else { let _ = wv.hide(); }
        }
    }
    Ok(())
}

#[tauri::command]
fn close_tab(app: AppHandle, id: String) -> Result<(), String> {
    let win = get_window(&app);
    if let Some(wv) = win.get_webview(&id) {
        wv.close().map_err(|e| e.to_string())?;
    }
    let reg = app.state::<TabRegistry>();
    reg.0.lock().unwrap().remove(&id);
    Ok(())
}

#[tauri::command]
fn navigate_tab(app: AppHandle, id: String, url: String) -> Result<(), String> {
    let win = get_window(&app);
    let target = tab_url(&url);
    if let Some(wv) = win.get_webview(&id) {
        match target {
            WebviewUrl::External(u) => wv.navigate(u).map_err(|e| e.to_string())?,
            WebviewUrl::App(p) => {
                let base = "http://tauri.localhost/";
                let full: tauri::Url = format!("{}{}", base, p.display())
                    .parse()
                    .map_err(|e: url::ParseError| e.to_string())?;
                wv.navigate(full).map_err(|e| e.to_string())?
            }
            _ => {}
        }
    }
    Ok(())
}

#[tauri::command]
fn go_back(app: AppHandle, id: String) -> Result<(), String> {
    let win = get_window(&app);
    if let Some(wv) = win.get_webview(&id) {
        wv.eval("window.history.back()").map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn go_forward(app: AppHandle, id: String) -> Result<(), String> {
    let win = get_window(&app);
    if let Some(wv) = win.get_webview(&id) {
        wv.eval("window.history.forward()").map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn reload_tab(app: AppHandle, id: String) -> Result<(), String> {
    let win = get_window(&app);
    if let Some(wv) = win.get_webview(&id) {
        wv.eval("window.location.reload()").map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn stop_tab(app: AppHandle, id: String) -> Result<(), String> {
    let win = get_window(&app);
    if let Some(wv) = win.get_webview(&id) {
        wv.eval("window.stop()").map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(TabRegistry(Mutex::new(HashMap::new())))
        .setup(|app| {
            let win = app.get_window("main").unwrap();

            // Resize child webviews when window is resized
            let app_handle = app.handle().clone();
            win.on_window_event(move |event| {
                if let tauri::WindowEvent::Resized(size) = event {
                    let w = size.width as f64;
                    let h = size.height as f64;
                    let reg = app_handle.state::<TabRegistry>();
                    let ids: Vec<String> = reg.0.lock().unwrap().keys().cloned().collect();
                    let win2 = get_window(&app_handle);
                    for id in &ids {
                        if let Some(wv) = win2.get_webview(id) {
                            let _ = wv.set_size(LogicalSize::new(w, h - CHROME_HEIGHT));
                        }
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            create_tab,
            activate_tab,
            close_tab,
            navigate_tab,
            go_back,
            go_forward,
            reload_tab,
            stop_tab,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
