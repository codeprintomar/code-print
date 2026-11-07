import sqlite3
import os
import json
from datetime import datetime, timedelta, date
import customtkinter as ctk
from tkinter import ttk, messagebox, filedialog, simpledialog
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from matplotlib.ticker import MaxNLocator
import threading
import time
import sys

# Try to import notification libraries
try:
    if sys.platform == "win32":
        import win10toast
        NOTIFICATIONS_AVAILABLE = True
    else:
        # For Linux/Mac, try plyer
        try:
            from plyer import notification
            NOTIFICATIONS_AVAILABLE = True
        except ImportError:
            NOTIFICATIONS_AVAILABLE = False
except ImportError:
    NOTIFICATIONS_AVAILABLE = False

# Database and constants
DB_FILE = "focus_sessions.db"
CONFIG_FILE = "app_config.json"
DATE_FMT = "%Y-%m-%d"
DT_FMT = "%Y-%m-%d %H:%M:%S"

# Set appearance
ctk.set_appearance_mode("dark")  # or "light"
ctk.set_default_color_theme("blue")

class FocusTrackerApp:
    def __init__(self):
        # Initialize CustomTkinter first
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")
        
        self.root = ctk.CTk()
        self.root.title("Focus Tracker - Professional Pomodoro")
        self.root.geometry("1000x700")
        self.root.resizable(True, True)
        
        # Initialize database connection
        try:
            self.conn = sqlite3.connect(DB_FILE)
            self._init_db()
            self._migrate_database()  # Handle database updates
        except Exception as e:
            messagebox.showerror("Database Error", f"Could not initialize database: {str(e)}")
            return
        
        # Timer variables
        self.is_focus_running = False
        self.is_break_running = False
        self.is_paused = False  # Added pause state
        self.remaining_seconds = 0
        self.session_start = None
        self.timer_thread = None
        self.stop_timer = False
        
        # Notification settings
        self.notifications_enabled = True
        self.auto_start_break = False
        self.sound_enabled = True
        
        # User authentication
        self.current_user_id = None
        self.remembered_login = self._load_config()
        
        # Initialize notification system
        self._init_notifications()
        
        
        # Setup UI
        try:
            self._setup_ui()
        except Exception as e:
            messagebox.showerror("UI Error", f"Could not initialize interface: {str(e)}")
            return
        
    def _init_db(self):
        cur = self.conn.cursor()
        
        # Users table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Sessions table with user support
        cur.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                start_time TEXT NOT NULL,
                end_time TEXT,
                project TEXT NOT NULL,
                part TEXT NOT NULL,
                duration_minutes INTEGER,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        """)
        
        self.conn.commit()
    
    def _migrate_database(self):
        """Handle database schema updates"""
        cur = self.conn.cursor()
        
        # Check if we need to add user_id column to sessions
        cur.execute("PRAGMA table_info(sessions)")
        columns = [column[1] for column in cur.fetchall()]
        
        if 'user_id' not in columns:
            try:
                cur.execute("ALTER TABLE sessions ADD COLUMN user_id INTEGER")
                self.conn.commit()
                print("Added user_id column to sessions table")
            except Exception as e:
                print(f"Could not add user_id column: {e}")
        
        if 'duration_minutes' not in columns:
            try:
                cur.execute("ALTER TABLE sessions ADD COLUMN duration_minutes INTEGER")
                self.conn.commit()
                print("Added duration_minutes column to sessions table")
            except Exception as e:
                print(f"Could not add duration_minutes column: {e}")
        
        # Update existing sessions without user_id
        try:
            cur.execute("UPDATE sessions SET user_id = 1 WHERE user_id IS NULL")
            self.conn.commit()
        except Exception as e:
            print(f"Could not update existing sessions: {e}")
    
    def _load_config(self):
        """Load saved configuration"""
        try:
            if os.path.exists(CONFIG_FILE):
                with open(CONFIG_FILE, 'r') as f:
                    config = json.load(f)
                    return config.get('remembered_login', {})
        except Exception as e:
            print(f"Could not load config: {e}")
        return {}
    
    def _save_config(self):
        """Save configuration"""
        try:
            config = {
                'remembered_login': self.remembered_login,
                'notifications_enabled': self.notifications_enabled,
                'auto_start_break': self.auto_start_break,
                'sound_enabled': self.sound_enabled
            }
            with open(CONFIG_FILE, 'w') as f:
                json.dump(config, f, indent=2)
        except Exception as e:
            print(f"Could not save config: {e}")
    
    def _init_notifications(self):
        """Initialize notification system based on platform"""
        if sys.platform == "win32" and NOTIFICATIONS_AVAILABLE:
            try:
                self.toaster = win10toast.ToastNotifier()
                self.notification_type = "windows"
            except:
                self.notification_type = "basic"
        elif NOTIFICATIONS_AVAILABLE:
            self.notification_type = "plyer"
        else:
            self.notification_type = "basic"
    
    def _send_notification(self, title, message, duration=5):
        """Send system notification"""
        if not self.notifications_enabled:
            return
            
        try:
            if self.notification_type == "windows":
                self.toaster.show_toast(
                    title,
                    message,
                    duration=duration,
                    icon_path=None,
                    threaded=True
                )
            elif self.notification_type == "plyer":
                notification.notify(
                    title=title,
                    message=message,
                    timeout=duration
                )
        except Exception as e:
            print(f"Notification error: {e}")
            # Fallback to system bell
            if self.sound_enabled:
                self.root.bell()
    
    def _setup_ui(self):
        # Check for remembered login first
        if self.remembered_login and 'user_id' in self.remembered_login:
            self.current_user_id = self.remembered_login['user_id']
        else:
            # Login first
            if not self._show_login():
                self.root.quit()
                return
        
        if self.current_user_id is None:
            messagebox.showerror("Error", "Login failed")
            self.root.quit()
            return
            
        # Main container
        self.main_frame = ctk.CTkFrame(self.root)
        self.main_frame.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Title
        title_label = ctk.CTkLabel(
            self.main_frame, 
            text="🎯 Focus Tracker Pro", 
            font=ctk.CTkFont(size=32, weight="bold")
        )
        title_label.pack(pady=(20, 10))
        
        # Subtitle
        subtitle_label = ctk.CTkLabel(
            self.main_frame, 
            text="Professional Pomodoro Timer with Analytics",
            font=ctk.CTkFont(size=16)
        )
        subtitle_label.pack(pady=(0, 30))
        
        # Create tabview
        self.tabview = ctk.CTkTabview(self.main_frame, width=900, height=500)
        self.tabview.pack(pady=20, padx=20, fill="both", expand=True)
        
        # Add tabs
        self.tabview.add("⏱️ Timer")
        self.tabview.add("📊 Analytics")
        self.tabview.add("⚙️ Settings")
        
        self._setup_timer_tab()
        self._setup_analytics_tab()
        self._setup_settings_tab()
        
        # Status bar
        self.status_var = ctk.StringVar(value="Ready to focus! 🚀")
        self.status_label = ctk.CTkLabel(self.root, textvariable=self.status_var)
        self.status_label.pack(side="bottom", pady=10)
        
    def _show_login(self):
        login_window = ctk.CTkToplevel()
        login_window.title("Login - Focus Tracker")
        login_window.geometry("400x350")
        login_window.transient(self.root)
        login_window.grab_set()
        
        # Center the window
        login_window.update_idletasks()
        x = (login_window.winfo_screenwidth() // 2) - (400 // 2)
        y = (login_window.winfo_screenheight() // 2) - (350 // 2)
        login_window.geometry(f"400x350+{x}+{y}")
        
        # Login UI
        ctk.CTkLabel(login_window, text="🔐 Welcome Back!", font=ctk.CTkFont(size=24, weight="bold")).pack(pady=30)
        
        username_entry = ctk.CTkEntry(login_window, placeholder_text="Username", width=250, height=40)
        username_entry.pack(pady=10)
        
        password_entry = ctk.CTkEntry(login_window, placeholder_text="Password", show="*", width=250, height=40)
        password_entry.pack(pady=10)
        
        # Remember me checkbox
        remember_var = ctk.BooleanVar()
        remember_check = ctk.CTkCheckBox(login_window, text="Remember me", variable=remember_var)
        remember_check.pack(pady=5)
        
        result = [False]  # Use list to modify from nested function
        
        def login():
            username = username_entry.get().strip()
            password = password_entry.get().strip()
            
            if not username or not password:
                messagebox.showerror("Error", "Please enter both username and password")
                return
                
            try:
                cur = self.conn.cursor()
                cur.execute("SELECT id FROM users WHERE username=? AND password=?", (username, password))
                user = cur.fetchone()
                
                if user:
                    self.current_user_id = user[0]
                    result[0] = True
                    
                    # Save login if remember me is checked
                    if remember_var.get():
                        self.remembered_login = {
                            'user_id': self.current_user_id,
                            'username': username
                        }
                        self._save_config()
                    
                    login_window.destroy()
                else:
                    messagebox.showerror("Error", "Invalid credentials")
            except Exception as e:
                messagebox.showerror("Error", f"Database error: {str(e)}")
        
        def register():
            username = username_entry.get().strip()
            password = password_entry.get().strip()
            
            if not username or not password:
                messagebox.showerror("Error", "Please enter both username and password")
                return
                
            if len(username) < 3:
                messagebox.showerror("Error", "Username must be at least 3 characters")
                return
                
            if len(password) < 4:
                messagebox.showerror("Error", "Password must be at least 4 characters")
                return
                
            try:
                cur = self.conn.cursor()
                cur.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
                self.conn.commit()
                messagebox.showinfo("Success", "Account created successfully! Please login.")
            except sqlite3.IntegrityError:
                messagebox.showerror("Error", "Username already exists")
            except Exception as e:
                messagebox.showerror("Error", f"Database error: {str(e)}")
        
        # Buttons
        button_frame = ctk.CTkFrame(login_window, fg_color="transparent")
        button_frame.pack(pady=20)
        
        ctk.CTkButton(button_frame, text="Login", command=login, width=100, height=35).pack(side="left", padx=10)
        ctk.CTkButton(button_frame, text="Register", command=register, width=100, height=35).pack(side="left", padx=10)
        
        # Handle window close
        def on_closing():
            result[0] = False
            login_window.destroy()
        
        login_window.protocol("WM_DELETE_WINDOW", on_closing)
        
        # Wait for login window to close
        self.root.wait_window(login_window)
        return result[0]
    
    def _setup_timer_tab(self):
        timer_frame = self.tabview.tab("⏱️ Timer")
        
        # Input section
        input_frame = ctk.CTkFrame(timer_frame)
        input_frame.pack(pady=20, padx=20, fill="x")
        
        # Project and task inputs
        input_grid = ctk.CTkFrame(input_frame)
        input_grid.pack(pady=20)
        
        ctk.CTkLabel(input_grid, text="📁 Project:", font=ctk.CTkFont(size=14, weight="bold")).grid(row=0, column=0, padx=10, pady=5, sticky="w")
        self.project_entry = ctk.CTkEntry(input_grid, placeholder_text="Enter project name", width=200)
        self.project_entry.grid(row=0, column=1, padx=10, pady=5)
        
        ctk.CTkLabel(input_grid, text="📋 Task:", font=ctk.CTkFont(size=14, weight="bold")).grid(row=0, column=2, padx=10, pady=5, sticky="w")
        self.task_entry = ctk.CTkEntry(input_grid, placeholder_text="Enter task/section", width=200)
        self.task_entry.grid(row=0, column=3, padx=10, pady=5)
        
        # Timer settings
        settings_frame = ctk.CTkFrame(input_frame)
        settings_frame.pack(pady=10)
        
        ctk.CTkLabel(settings_frame, text="⏰ Focus Time:", font=ctk.CTkFont(size=14, weight="bold")).grid(row=0, column=0, padx=10, pady=5)
        self.focus_minutes = ctk.IntVar(value=25)
        focus_slider = ctk.CTkSlider(settings_frame, from_=5, to=120, variable=self.focus_minutes, width=150)
        focus_slider.grid(row=0, column=1, padx=10, pady=5)
        self.focus_label = ctk.CTkLabel(settings_frame, text="25 min")
        self.focus_label.grid(row=0, column=2, padx=5, pady=5)
        
        ctk.CTkLabel(settings_frame, text="☕ Break Time:", font=ctk.CTkFont(size=14, weight="bold")).grid(row=0, column=3, padx=10, pady=5)
        self.break_minutes = ctk.IntVar(value=5)
        break_slider = ctk.CTkSlider(settings_frame, from_=1, to=30, variable=self.break_minutes, width=150)
        break_slider.grid(row=0, column=4, padx=10, pady=5)
        self.break_label = ctk.CTkLabel(settings_frame, text="5 min")
        self.break_label.grid(row=0, column=5, padx=5, pady=5)
        
        # Update labels when sliders change
        focus_slider.configure(command=lambda x: self.focus_label.configure(text=f"{int(x)} min"))
        break_slider.configure(command=lambda x: self.break_label.configure(text=f"{int(x)} min"))
        
        # Timer display
        self.timer_display = ctk.CTkLabel(
            timer_frame, 
            text="25:00", 
            font=ctk.CTkFont(size=60, weight="bold"),
            text_color=("gray10", "gray90")
        )
        self.timer_display.pack(pady=30)
        
        # Control buttons
        button_frame = ctk.CTkFrame(timer_frame, fg_color="transparent")
        button_frame.pack(pady=20)
        
        self.start_btn = ctk.CTkButton(
            button_frame, 
            text="🎯 Start Focus", 
            command=self.start_focus,
            width=120, 
            height=40,
            font=ctk.CTkFont(size=14, weight="bold")
        )
        self.start_btn.pack(side="left", padx=10)
        
        # Changed Stop button to Pause/Resume
        self.pause_btn = ctk.CTkButton(
            button_frame, 
            text="⏸️ Pause", 
            command=self.toggle_pause,
            width=120, 
            height=40,
            state="disabled"
        )
        self.pause_btn.pack(side="left", padx=10)
        
        # Stop button (completely stops and saves session)
        self.stop_btn = ctk.CTkButton(
            button_frame, 
            text="⏹️ Stop", 
            command=self.stop_session,
            width=120, 
            height=40,
            state="disabled"
        )
        self.stop_btn.pack(side="left", padx=10)
        
        self.break_btn = ctk.CTkButton(
            button_frame, 
            text="☕ Break", 
            command=self.start_break,
            width=120, 
            height=40,
            state="disabled"
        )
        self.break_btn.pack(side="left", padx=10)
        
        # Progress bar
        self.progress = ctk.CTkProgressBar(timer_frame, width=400)
        self.progress.pack(pady=20)
        self.progress.set(0)
    
    def _setup_analytics_tab(self):
        analytics_frame = self.tabview.tab("📊 Analytics")
        
        # Date selection
        date_frame = ctk.CTkFrame(analytics_frame)
        date_frame.pack(pady=20, padx=20, fill="x")
        
        date_grid = ctk.CTkFrame(date_frame)
        date_grid.pack(pady=20)
        
        ctk.CTkLabel(date_grid, text="From:", font=ctk.CTkFont(size=14, weight="bold")).grid(row=0, column=0, padx=10, pady=5)
        self.from_date_entry = ctk.CTkEntry(date_grid, placeholder_text="YYYY-MM-DD", width=120)
        self.from_date_entry.insert(0, date.today().replace(day=1).strftime(DATE_FMT))
        self.from_date_entry.grid(row=0, column=1, padx=10, pady=5)
        
        ctk.CTkLabel(date_grid, text="To:", font=ctk.CTkFont(size=14, weight="bold")).grid(row=0, column=2, padx=10, pady=5)
        self.to_date_entry = ctk.CTkEntry(date_grid, placeholder_text="YYYY-MM-DD", width=120)
        self.to_date_entry.insert(0, date.today().strftime(DATE_FMT))
        self.to_date_entry.grid(row=0, column=3, padx=10, pady=5)
        
        ctk.CTkButton(date_grid, text="📊 Generate Report", command=self.generate_report).grid(row=0, column=4, padx=20, pady=5)
        ctk.CTkButton(date_grid, text="📄 Export PDF", command=self.export_pdf).grid(row=0, column=5, padx=10, pady=5)
        
        # Stats display
        self.stats_frame = ctk.CTkFrame(analytics_frame)
        self.stats_frame.pack(pady=20, padx=20, fill="both", expand=True)
        
        self.total_label = ctk.CTkLabel(
            self.stats_frame, 
            text="Total Focus Time: 0 hours", 
            font=ctk.CTkFont(size=18, weight="bold")
        )
        self.total_label.pack(pady=10)
        
        # Sessions table with scrollbar
        self.tree_frame = ctk.CTkFrame(self.stats_frame)
        self.tree_frame.pack(pady=10, padx=20, fill="both", expand=True)
        
        # Create frame for treeview and scrollbar
        tree_container = ctk.CTkFrame(self.tree_frame)
        tree_container.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Create Treeview with custom style
        style = ttk.Style()
        style.configure("Custom.Treeview", 
                       background="#2b2b2b", 
                       foreground="white", 
                       fieldbackground="#2b2b2b",
                       borderwidth=0,
                       focuscolor="none")
        style.configure("Custom.Treeview.Heading", 
                       background="#404040", 
                       foreground="white",
                       borderwidth=1)
        
        self.tree = ttk.Treeview(
            tree_container,
            columns=("project", "task", "start", "end", "duration"),
            show="headings",
            height=12,
            style="Custom.Treeview"
        )
        
        # Define headings
        self.tree.heading("project", text="Project")
        self.tree.heading("task", text="Task")
        self.tree.heading("start", text="Start Time")
        self.tree.heading("end", text="End Time")
        self.tree.heading("duration", text="Duration (min)")
        
        # Configure columns
        self.tree.column("project", width=150)
        self.tree.column("task", width=150)
        self.tree.column("start", width=130)
        self.tree.column("end", width=130)
        self.tree.column("duration", width=100, anchor="center")
        
        # Scrollbars
        v_scrollbar = ttk.Scrollbar(tree_container, orient="vertical", command=self.tree.yview)
        h_scrollbar = ttk.Scrollbar(tree_container, orient="horizontal", command=self.tree.xview)
        self.tree.configure(yscrollcommand=v_scrollbar.set, xscrollcommand=h_scrollbar.set)
        
        # Pack treeview and scrollbars
        self.tree.grid(row=0, column=0, sticky="nsew")
        v_scrollbar.grid(row=0, column=1, sticky="ns")
        h_scrollbar.grid(row=1, column=0, sticky="ew")
        
        # Configure grid weights
        tree_container.grid_rowconfigure(0, weight=1)
        tree_container.grid_columnconfigure(0, weight=1)
    
    def _setup_settings_tab(self):
        settings_frame = self.tabview.tab("⚙️ Settings")
        
        # User info
        user_frame = ctk.CTkFrame(settings_frame)
        user_frame.pack(pady=20, padx=20, fill="x")
        
        ctk.CTkLabel(user_frame, text="👤 User Settings", font=ctk.CTkFont(size=18, weight="bold")).pack(pady=10)
        
        # Get current user info
        cur = self.conn.cursor()
        cur.execute("SELECT username FROM users WHERE id=?", (self.current_user_id,))
        user_result = cur.fetchone()
        username = user_result[0] if user_result else "Unknown"
        
        ctk.CTkLabel(user_frame, text=f"Logged in as: {username}", font=ctk.CTkFont(size=14)).pack(pady=5)
        
        # Logout button
        logout_btn = ctk.CTkButton(
            user_frame, 
            text="🚪 Logout", 
            command=self._logout,
            width=120,
            height=30
        )
        logout_btn.pack(pady=10)
        
        # Appearance settings
        appearance_frame = ctk.CTkFrame(settings_frame)
        appearance_frame.pack(pady=20, padx=20, fill="x")
        
        ctk.CTkLabel(appearance_frame, text="🎨 Appearance", font=ctk.CTkFont(size=18, weight="bold")).pack(pady=10)
        
        theme_frame = ctk.CTkFrame(appearance_frame)
        theme_frame.pack(pady=10)
        
        ctk.CTkLabel(theme_frame, text="Theme:").pack(side="left", padx=10)
        
        def change_theme(choice):
            ctk.set_appearance_mode(choice)
            
        theme_menu = ctk.CTkOptionMenu(theme_frame, values=["dark", "light", "system"], command=change_theme)
        theme_menu.pack(side="left", padx=10)
        theme_menu.set("dark")
        
        # Notification settings
        notification_frame = ctk.CTkFrame(settings_frame)
        notification_frame.pack(pady=20, padx=20, fill="x")
        
        ctk.CTkLabel(notification_frame, text="🔔 Notifications", font=ctk.CTkFont(size=18, weight="bold")).pack(pady=10)
        
        # Notification toggles
        notif_controls = ctk.CTkFrame(notification_frame)
        notif_controls.pack(pady=10)
        
        self.notifications_var = ctk.BooleanVar(value=True)
        notif_check = ctk.CTkCheckBox(
            notif_controls, 
            text="Enable system notifications",
            variable=self.notifications_var,
            command=lambda: setattr(self, 'notifications_enabled', self.notifications_var.get())
        )
        notif_check.pack(anchor="w", padx=10, pady=5)
        
        self.sound_var = ctk.BooleanVar(value=True)
        sound_check = ctk.CTkCheckBox(
            notif_controls, 
            text="Enable sound alerts",
            variable=self.sound_var,
            command=lambda: setattr(self, 'sound_enabled', self.sound_var.get())
        )
        sound_check.pack(anchor="w", padx=10, pady=5)
        
        self.auto_break_var = ctk.BooleanVar(value=False)
        auto_break_check = ctk.CTkCheckBox(
            notif_controls, 
            text="Auto-start break after focus session",
            variable=self.auto_break_var,
            command=lambda: setattr(self, 'auto_start_break', self.auto_break_var.get())
        )
        auto_break_check.pack(anchor="w", padx=10, pady=5)
        
        # Test notification button
        test_notif_btn = ctk.CTkButton(
            notif_controls,
            text="🔔 Test Notification",
            command=self._test_notification,
            width=150
        )
        test_notif_btn.pack(anchor="w", padx=10, pady=10)
        
        # Data management
        data_frame = ctk.CTkFrame(settings_frame)
        data_frame.pack(pady=20, padx=20, fill="x")
        
        ctk.CTkLabel(data_frame, text="🗂️ Data Management", font=ctk.CTkFont(size=18, weight="bold")).pack(pady=10)
        
        button_frame = ctk.CTkFrame(data_frame)
        button_frame.pack(pady=10)
        
        ctk.CTkButton(button_frame, text="🗑️ Clear All Sessions", command=self.clear_sessions, 
                     hover_color="red", width=150).pack(side="left", padx=10)
        
        ctk.CTkButton(button_frame, text="📤 Backup Data", command=self.backup_data, width=150).pack(side="left", padx=10)
    
    def _test_notification(self):
        """Test the notification system"""
        self._send_notification("Focus Tracker", "Test notification - System is working! 🎯")
        if self.sound_enabled:
            self.root.bell()
        self.status_var.set("🔔 Test notification sent!")
    
    def _logout(self):
        """Logout and clear saved credentials"""
        self.remembered_login = {}
        self._save_config()
        messagebox.showinfo("Logout", "You have been logged out successfully!")
        self.root.quit()
    
    def start_focus(self):
        if self.is_focus_running or self.is_break_running:
            return
            
        project = self.project_entry.get().strip()
        task = self.task_entry.get().strip()
        
        if not project:
            messagebox.showwarning("Warning", "Please enter a project name")
            return
            
        if not task:
            task = "General Task"
            
        self.session_start = datetime.now()
        self.remaining_seconds = int(self.focus_minutes.get()) * 60
        self.total_seconds = self.remaining_seconds
        self.is_focus_running = True
        self.is_paused = False
        
        # Update UI
        self.start_btn.configure(state="disabled")
        self.pause_btn.configure(state="normal", text="⏸️ Pause")
        self.stop_btn.configure(state="normal")
        self.project_entry.configure(state="disabled")
        self.task_entry.configure(state="disabled")
        
        self.status_var.set("🎯 Focus session in progress...")
        
        # Start timer thread
        self.stop_timer = False
        self.timer_thread = threading.Thread(target=self._timer_worker, args=("focus",))
        self.timer_thread.daemon = True
        self.timer_thread.start()
    
    def toggle_pause(self):
        """Toggle pause/resume for timer"""
        if self.is_paused:
            # Resume
            self.is_paused = False
            self.pause_btn.configure(text="⏸️ Pause")
            self.status_var.set("🎯 Focus session resumed...")
            
            # Restart timer thread
            self.stop_timer = False
            timer_type = "focus" if self.is_focus_running else "break"
            self.timer_thread = threading.Thread(target=self._timer_worker, args=(timer_type,))
            self.timer_thread.daemon = True
            self.timer_thread.start()
        else:
            # Pause
            self.is_paused = True
            self.stop_timer = True
            self.pause_btn.configure(text="▶️ Resume")
            self.status_var.set("⏸️ Timer paused...")
    
    def start_break(self):
        if self.is_focus_running or self.is_break_running:
            return
            
        self.remaining_seconds = int(self.break_minutes.get()) * 60
        self.total_seconds = self.remaining_seconds
        self.is_break_running = True
        self.is_paused = False
        
        # Update UI
        self.break_btn.configure(state="disabled")
        self.pause_btn.configure(state="normal", text="⏸️ Pause")
        self.stop_btn.configure(state="normal")
        
        self.status_var.set("☕ Break time! Relax...")
        
        # Start timer thread
        self.stop_timer = False
        self.timer_thread = threading.Thread(target=self._timer_worker, args=("break",))
        self.timer_thread.daemon = True
        self.timer_thread.start()
    
    def stop_session(self):
        self.stop_timer = True
        
        if self.is_focus_running:
            # Save session
            end_time = datetime.now()
            duration = max(1, int((end_time - self.session_start).total_seconds() // 60))
            
            try:
                cur = self.conn.cursor()
                cur.execute("""
                    INSERT INTO sessions (user_id, start_time, end_time, project, part, duration_minutes) 
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    self.current_user_id,
                    self.session_start.strftime(DT_FMT),
                    end_time.strftime(DT_FMT),
                    self.project_entry.get().strip(),
                    self.task_entry.get().strip(),
                    duration
                ))
                self.conn.commit()
                
                self.status_var.set(f"✅ Session saved! {duration} minutes completed.")
                self.break_btn.configure(state="normal")
            except Exception as e:
                messagebox.showerror("Database Error", f"Could not save session: {str(e)}")
                print(f"Database error: {e}")
            
        self.is_focus_running = False
        self.is_break_running = False
        self.is_paused = False
        
        # Reset UI
        self._reset_ui_state()
    
    def _reset_ui_state(self):
        """Reset UI to ready state"""
        self.start_btn.configure(state="normal")
        self.pause_btn.configure(state="disabled", text="⏸️ Pause")
        self.stop_btn.configure(state="disabled")
        self.project_entry.configure(state="normal")
        self.task_entry.configure(state="normal")
        
        if not self.is_break_running:
            self.break_btn.configure(state="disabled")
        
        self.timer_display.configure(text=f"{self.focus_minutes.get():02d}:00")
        self.progress.set(0)
        
        if not self.is_focus_running and not self.is_break_running:
            self.status_var.set("Ready to focus! 🚀")
    
    def _timer_worker(self, timer_type):
        while self.remaining_seconds > 0 and not self.stop_timer and not self.is_paused:
            # Update display on main thread
            self.root.after(0, self._update_timer_display)
            
            time.sleep(1)
            self.remaining_seconds -= 1
        
        if not self.stop_timer and not self.is_paused:
            # Timer completed
            self.root.after(0, lambda: self._timer_completed(timer_type))
    
    def _update_timer_display(self):
        minutes, seconds = divmod(self.remaining_seconds, 60)
        self.timer_display.configure(text=f"{minutes:02d}:{seconds:02d}")
        
        # Update progress bar
        if self.total_seconds > 0:
            progress = 1 - (self.remaining_seconds / self.total_seconds)
            self.progress.set(progress)
    
    def _timer_completed(self, timer_type):
        if timer_type == "focus":
            # Auto-save completed focus session
            end_time = datetime.now()
            duration = int(self.focus_minutes.get())
            
            cur = self.conn.cursor()
            cur.execute("""
                INSERT INTO sessions (user_id, start_time, end_time, project, part, duration_minutes) 
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                self.current_user_id,
                self.session_start.strftime(DT_FMT),
                end_time.strftime(DT_FMT),
                self.project_entry.get().strip(),
                self.task_entry.get().strip(),
                duration
            ))
            self.conn.commit()
            
            # Send notification
            project_name = self.project_entry.get().strip()
            self._send_notification(
                "🎉 Focus Session Complete!",
                f"Great job! You focused on '{project_name}' for {duration} minutes. Time for a break! ☕"
            )
            
            self.status_var.set("🎉 Focus session completed! Time for a break!")
            
            # Show completion dialog with options
            self._show_session_complete_dialog("focus", duration)
            
        elif timer_type == "break":
            self._send_notification(
                "⚡ Break Time Over!",
                "Break finished! Ready for another productive focus session? 🚀"
            )
            self.status_var.set("⚡ Break over! Ready for another focus session!")
            
            # Show completion dialog
            self._show_session_complete_dialog("break")
        
        # Play notification sound
        if self.sound_enabled:
            self.root.bell()
        
        # Reset states
        self.is_focus_running = False
        self.is_break_running = False
        self.is_paused = False
        
        # Reset UI
        self._reset_ui_state()
        
        # Bring window to front
        self.root.lift()
        self.root.attributes('-topmost', True)
        self.root.after(1000, lambda: self.root.attributes('-topmost', False))
    
    def _show_session_complete_dialog(self, session_type, duration=None):
        """Show custom completion dialog with options"""
        dialog = ctk.CTkToplevel(self.root)
        dialog.title("Session Complete!")
        dialog.geometry("400x300")
        dialog.transient(self.root)
        dialog.grab_set()
        
        # Center the dialog
        dialog.update_idletasks()
        x = (dialog.winfo_screenwidth() // 2) - (200)
        y = (dialog.winfo_screenheight() // 2) - (150)
        dialog.geometry(f"400x300+{x}+{y}")
        
        if session_type == "focus":
            # Focus session completed
            title_text = "🎉 Focus Session Complete!"
            message_text = f"Excellent work!\nYou focused for {duration} minutes.\n\nWhat would you like to do next?"
            
            ctk.CTkLabel(dialog, text=title_text, font=ctk.CTkFont(size=20, weight="bold")).pack(pady=20)
            ctk.CTkLabel(dialog, text=message_text, font=ctk.CTkFont(size=14)).pack(pady=10)
            
            button_frame = ctk.CTkFrame(dialog, fg_color="transparent")
            button_frame.pack(pady=20)
            
            def start_break_now():
                dialog.destroy()
                self.break_btn.configure(state="normal")
                if self.auto_start_break:
                    self.start_break()
                else:
                    self.status_var.set("☕ Ready to start break when you are!")
            
            def new_focus_session():
                dialog.destroy()
                self.break_btn.configure(state="disabled")
                self.status_var.set("🎯 Ready for a new focus session!")
            
            def take_long_break():
                dialog.destroy()
                self.break_btn.configure(state="normal")
                # Set break time to 15 minutes for long break
                original_break_time = self.break_minutes.get()
                self.break_minutes.set(15)
                self.start_break()
                # Reset break time after starting
                self.root.after(1000, lambda: self.break_minutes.set(original_break_time))
            
            if self.auto_start_break:
                ctk.CTkLabel(dialog, text="Starting break automatically in 3 seconds...", 
                           font=ctk.CTkFont(size=12)).pack(pady=5)
                dialog.after(3000, start_break_now)
            else:
                ctk.CTkButton(button_frame, text="☕ Start Break", command=start_break_now, width=120).pack(pady=5)
                ctk.CTkButton(button_frame, text="🎯 New Focus", command=new_focus_session, width=120).pack(pady=5)
                ctk.CTkButton(button_frame, text="😴 Long Break (15m)", command=take_long_break, width=120).pack(pady=5)
            
        else:  # break session completed
            title_text = "⚡ Break Time Over!"
            message_text = "Break finished!\nReady for another productive session?"
            
            ctk.CTkLabel(dialog, text=title_text, font=ctk.CTkFont(size=20, weight="bold")).pack(pady=20)
            ctk.CTkLabel(dialog, text=message_text, font=ctk.CTkFont(size=14)).pack(pady=10)
            
            button_frame = ctk.CTkFrame(dialog, fg_color="transparent")
            button_frame.pack(pady=20)
            
            def start_new_focus():
                dialog.destroy()
                self.status_var.set("🎯 Ready for a new focus session!")
            
            def extend_break():
                dialog.destroy()
                self.start_break()  # Start another break
            
            ctk.CTkButton(button_frame, text="🎯 Start Focusing", command=start_new_focus, width=120).pack(pady=5)
            ctk.CTkButton(button_frame, text="☕ Extend Break", command=extend_break, width=120).pack(pady=5)
        
        # Auto-close dialog after 30 seconds
        dialog.after(30000, dialog.destroy)
    
    def generate_report(self):
        try:
            from_date = datetime.strptime(self.from_date_entry.get(), DATE_FMT).date()
            to_date = datetime.strptime(self.to_date_entry.get(), DATE_FMT).date()
            
            if from_date > to_date:
                messagebox.showerror("Error", "From date must be before To date")
                return
                
        except ValueError:
            messagebox.showerror("Error", "Please enter valid dates (YYYY-MM-DD)")
            return
        
        # Query sessions
        cur = self.conn.cursor()
        start_datetime = datetime.combine(from_date, datetime.min.time()).strftime(DT_FMT)
        end_datetime = datetime.combine(to_date, datetime.max.time()).strftime(DT_FMT)
        
        cur.execute("""
            SELECT start_time, end_time, project, part, duration_minutes
            FROM sessions
            WHERE user_id = ? AND start_time BETWEEN ? AND ?
            AND end_time IS NOT NULL
            ORDER BY start_time DESC
        """, (self.current_user_id, start_datetime, end_datetime))
        
        sessions = cur.fetchall()
        
        # Clear existing data
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        total_minutes = 0
        for session in sessions:
            start_str, end_str, project, part, duration = session
            if duration:
                total_minutes += duration
            
            # Format times for display
            start_dt = datetime.strptime(start_str, DT_FMT)
            end_dt = datetime.strptime(end_str, DT_FMT) if end_str else None
            
            self.tree.insert("", "end", values=(
                project,
                part,
                start_dt.strftime("%m/%d %H:%M"),
                end_dt.strftime("%m/%d %H:%M") if end_dt else "N/A",
                duration or 0
            ))
        
        # Update total
        hours = total_minutes / 60
        self.total_label.configure(text=f"📊 Total Focus Time: {total_minutes} minutes ({hours:.1f} hours)")
        
        self.status_var.set(f"📈 Report generated: {len(sessions)} sessions, {hours:.1f} hours")
    
    def export_pdf(self):
        try:
            from_date = datetime.strptime(self.from_date_entry.get(), DATE_FMT).date()
            to_date = datetime.strptime(self.to_date_entry.get(), DATE_FMT).date()
        except ValueError:
            messagebox.showerror("Error", "Please enter valid dates first")
            return
        
        # Get data for tasks (changed from projects)
        cur = self.conn.cursor()
        start_datetime = datetime.combine(from_date, datetime.min.time()).strftime(DT_FMT)
        end_datetime = datetime.combine(to_date, datetime.max.time()).strftime(DT_FMT)
        
        # Changed query to group by task instead of project
        cur.execute("""
            SELECT project, part, SUM(duration_minutes), COUNT(*)
            FROM sessions
            WHERE user_id = ? AND start_time BETWEEN ? AND ?
            AND duration_minutes IS NOT NULL
            GROUP BY project, part
            ORDER BY SUM(duration_minutes) DESC
        """, (self.current_user_id, start_datetime, end_datetime))
        
        task_data = cur.fetchall()
        
        if not task_data:
            messagebox.showinfo("No Data", "No sessions found in the selected date range")
            return
        
        # Ask for save location
        filename = filedialog.asksaveasfilename(
            defaultextension=".pdf",
            filetypes=[("PDF files", "*.pdf")],
            title="Save Report As"
        )
        
        if not filename:
            return
        
        # Create PDF
        try:
            with PdfPages(filename) as pdf:
                # Summary page
                fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(11.69, 8.27))
                fig.suptitle(f'Focus Tracker Report\n{from_date} to {to_date}', fontsize=16, fontweight='bold')
                
                # Pie chart by task (changed from project)
                tasks = {}
                for proj, part, minutes, count in task_data:
                    task_label = f"{proj} - {part}"
                    tasks[task_label] = tasks.get(task_label, 0) + minutes
                
                if tasks:
                    labels = list(tasks.keys())
                    sizes = list(tasks.values())
                    
                    # Generate distinct colors for each task
                    import matplotlib.cm as cm
                    import numpy as np
                    colors = cm.Set3(np.linspace(0, 1, len(labels)))
                    
                    # Truncate labels if too long
                    display_labels = [label[:20] + "..." if len(label) > 20 else label for label in labels]
                    
                    wedges, texts = ax1.pie(sizes, labels=display_labels, colors=colors, startangle=90)
                    ax1.set_title('Time by Task')
                
                # Bar chart by task
                if len(task_data) <= 10:
                    task_names = [f"{proj} - {part}" for proj, part, _, _ in task_data[:10]]
                    task_names = [name[:30] + "..." if len(name) > 30 else name for name in task_names]
                    minutes_list = [minutes for _, _, minutes, _ in task_data[:10]]
                    
                    ax2.barh(task_names, minutes_list, color=colors[:len(task_names)])
                    ax2.set_title('Time by Task (Top 10)')
                    ax2.set_xlabel('Minutes')
                
                # Daily activity
                cur.execute("""
                    SELECT DATE(start_time) as day, SUM(duration_minutes)
                    FROM sessions
                    WHERE user_id = ? AND start_time BETWEEN ? AND ?
                    GROUP BY DATE(start_time)
                    ORDER BY day
                """, (self.current_user_id, start_datetime, end_datetime))
                
                daily_data = cur.fetchall()
                if daily_data:
                    days = [datetime.strptime(day, "%Y-%m-%d").date() for day, _ in daily_data]
                    daily_minutes = [minutes or 0 for _, minutes in daily_data]
                    
                    ax3.plot(days, daily_minutes, marker='o', linewidth=2, markersize=4)
                    ax3.set_title('Daily Focus Time')
                    ax3.set_ylabel('Minutes')
                    ax3.tick_params(axis='x', rotation=45)
                
                # Statistics
                total_minutes = sum(minutes for _, _, minutes, _ in task_data)
                total_sessions = sum(count for _, _, _, count in task_data)
                avg_session = total_minutes / total_sessions if total_sessions > 0 else 0
                
                stats_text = f"""
                📊 STATISTICS
                
                Total Focus Time: {total_minutes} min ({total_minutes/60:.1f} hrs)
                Total Sessions: {total_sessions}
                Average Session: {avg_session:.1f} min
                Most Time on Task: {max(tasks, key=tasks.get) if tasks else 'N/A'}
                Days Active: {len(daily_data)}
                """
                
                ax4.text(0.1, 0.5, stats_text, fontsize=12, verticalalignment='center',
                        bbox=dict(boxstyle="round,pad=0.3", facecolor="lightblue", alpha=0.5))
                ax4.set_xlim(0, 1)
                ax4.set_ylim(0, 1)
                ax4.axis('off')
                
                plt.tight_layout()
                pdf.savefig(fig, bbox_inches='tight')
                plt.close(fig)
                
                # Detailed sessions table
                fig, ax = plt.subplots(figsize=(11.69, 8.27))
                fig.suptitle('Detailed Sessions', fontsize=16, fontweight='bold')
                
                # Get all sessions for table
                cur.execute("""
                    SELECT start_time, end_time, project, part, duration_minutes
                    FROM sessions
                    WHERE user_id = ? AND start_time BETWEEN ? AND ?
                    ORDER BY start_time DESC
                    LIMIT 50
                """, (self.current_user_id, start_datetime, end_datetime))
                
                all_sessions = cur.fetchall()
                
                if all_sessions:
                    table_data = []
                    for session in all_sessions:
                        start_str, end_str, project, part, duration = session
                        start_dt = datetime.strptime(start_str, DT_FMT)
                        end_dt = datetime.strptime(end_str, DT_FMT) if end_str else None
                        
                        table_data.append([
                            start_dt.strftime("%m/%d %H:%M"),
                            end_dt.strftime("%H:%M") if end_dt else "N/A",
                            project[:20] + "..." if len(project) > 20 else project,
                            part[:20] + "..." if len(part) > 20 else part,
                            f"{duration} min" if duration else "0 min"
                        ])
                    
                    table = ax.table(cellText=table_data,
                                   colLabels=['Start', 'End', 'Project', 'Task', 'Duration'],
                                   cellLoc='center',
                                   loc='center',
                                   colWidths=[0.15, 0.15, 0.25, 0.25, 0.2])
                    
                    table.auto_set_font_size(False)
                    table.set_fontsize(9)
                    table.scale(1, 1.5)
                    
                    # Style the table
                    for (i, j), cell in table.get_celld().items():
                        if i == 0:  # Header
                            cell.set_text_props(weight='bold')
                            cell.set_facecolor('#4472C4')
                            cell.set_text_props(color='white')
                        else:
                            cell.set_facecolor('#F2F2F2' if i % 2 == 0 else 'white')
                
                ax.axis('off')
                pdf.savefig(fig, bbox_inches='tight')
                plt.close(fig)
            
            self.status_var.set(f"📄 PDF exported successfully: {os.path.basename(filename)}")
            messagebox.showinfo("Export Complete", f"Report saved as:\n{filename}")
            
        except Exception as e:
            messagebox.showerror("Export Error", f"Failed to create PDF: {str(e)}")
    
    def clear_sessions(self):
        result = messagebox.askyesno(
            "Confirm Delete", 
            "Are you sure you want to delete ALL your focus sessions?\nThis action cannot be undone!"
        )
        
        if result:
            cur = self.conn.cursor()
            cur.execute("DELETE FROM sessions WHERE user_id = ?", (self.current_user_id,))
            self.conn.commit()
            
            # Clear the display
            for item in self.tree.get_children():
                self.tree.delete(item)
            
            self.total_label.configure(text="📊 Total Focus Time: 0 hours")
            self.status_var.set("🗑️ All sessions cleared")
            
            messagebox.showinfo("Success", "All sessions have been deleted.")
    
    def backup_data(self):
        filename = filedialog.asksaveasfilename(
            defaultextension=".db",
            filetypes=[("Database files", "*.db"), ("All files", "*.*")],
            title="Backup Database"
        )
        
        if filename:
            try:
                import shutil
                shutil.copy2(DB_FILE, filename)
                self.status_var.set(f"💾 Database backed up to: {os.path.basename(filename)}")
                messagebox.showinfo("Backup Complete", f"Database backed up successfully to:\n{filename}")
            except Exception as e:
                messagebox.showerror("Backup Error", f"Failed to backup database: {str(e)}")
    
    def run(self):
        # Set window icon (if available)
        try:
            self.root.iconbitmap("icon.ico")  # Add your icon file
        except:
            pass
        
        # Center window on screen
        self.root.update_idletasks()
        width = self.root.winfo_width()
        height = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f"{width}x{height}+{x}+{y}")
        
        # Handle window close
        def on_closing():
            self.stop_timer = True
            self._save_config()  # Save settings before closing
            if hasattr(self, 'conn'):
                self.conn.close()
            self.root.destroy()
        
        self.root.protocol("WM_DELETE_WINDOW", on_closing)
        
        # Start the application
        self.root.mainloop()

def main():
    """Main entry point"""
    # Check if required modules are installed
    try:
        import customtkinter
        import matplotlib.pyplot
    except ImportError as e:
        print(f"Missing required module: {e}")
        print("Please install required packages:")
        print("pip install customtkinter matplotlib")
        if sys.platform == "win32":
            print("pip install win10toast  # For Windows notifications")
        else:
            print("pip install plyer  # For cross-platform notifications")
        return
    
    try:
        app = FocusTrackerApp()
        if hasattr(app, 'root') and app.root:
            app.run()
    except Exception as e:
        print(f"Error starting application: {e}")
        import traceback
        traceback.print_exc()
        try:
            messagebox.showerror("Startup Error", f"Failed to start application: {e}")
        except:
            pass

if __name__ == "__main__":
    main()