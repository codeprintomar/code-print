import sys
import os
import json
import bcrypt
import subprocess
import datetime
import traceback
from PyQt5 import QtWidgets, QtGui, QtCore
from plyer import notification
from openpyxl import Workbook
from fpdf import FPDF
import requests
from io import BytesIO

# -------------- ثوابت وأعدادات --------------
APP_NAME = "Advanced To-Do List"
USER_DATA_FILE = "users.json"
TOGGL_PATH = r"C:\Users\%USERNAME%\AppData\Local\Programs\TogglDesktop\TogglDesktop.exe"  # عدّل على حسب جهازك

# ---------------- دالة تحميل الأيقونات ----------------
def load_icon(name):
    icon_map = {
        "sign-in": "https://cdn-icons-png.flaticon.com/512/1828/1828490.png",
        "user-plus": "https://cdn-icons-png.flaticon.com/512/1828/1828506.png",
        "user": "https://cdn-icons-png.flaticon.com/512/1828/1828427.png",
        "camera": "https://cdn-icons-png.flaticon.com/512/747/747545.png",
        "plus": "https://cdn-icons-png.flaticon.com/512/1828/1828817.png",
        "trash": "https://cdn-icons-png.flaticon.com/512/1214/1214428.png",
        "clock": "https://cdn-icons-png.flaticon.com/512/1828/1828884.png",
        "file-excel": "https://cdn-icons-png.flaticon.com/512/732/732220.png",
        "file-pdf": "https://cdn-icons-png.flaticon.com/512/337/337946.png",
        "check-square": "https://cdn-icons-png.flaticon.com/512/1828/1828640.png",
        # Add more mappings as needed
    }
    url = icon_map.get(name)
    if not url:
        return QtGui.QIcon()  # Return empty icon if not found
    try:
        response = requests.get(url)
        response.raise_for_status()
        image = QtGui.QImage()
        image.loadFromData(response.content)
        pixmap = QtGui.QPixmap.fromImage(image)
        return QtGui.QIcon(pixmap)
    except Exception as e:
        print(f"Failed to load icon '{name}' from {url}: {e}")
        return QtGui.QIcon()

THEMES = {
    "Dark": """
        QWidget { background-color: #2b2b2b; color: #ddd; }
        QPushButton { background-color: #444; border-radius: 5px; }
        QPushButton:hover { background-color: #555; }
        QLineEdit, QTextEdit, QComboBox { background-color: #333; color: #eee; border: 1px solid #555; }
        QListWidget, QTreeWidget { background-color: #222; color: #eee; }
        QCheckBox::indicator:checked { background-color: #66bb6a; }
    """,
    "Light": """
        QWidget { background-color: #f0f0f0; color: #222; }
        QPushButton { background-color: #ddd; border-radius: 5px; }
        QPushButton:hover { background-color: #ccc; }
        QLineEdit, QTextEdit, QComboBox { background-color: #fff; color: #222; border: 1px solid #ccc; }
        QListWidget, QTreeWidget { background-color: #fff; color: #000; }
        QCheckBox::indicator:checked { background-color: #4caf50; }
    """,
    "Blue": """
        QWidget { background-color: #1e3a8a; color: #cbd5e1; }
        QPushButton { background-color: #2563eb; border-radius: 5px; }
        QPushButton:hover { background-color: #3b82f6; }
        QLineEdit, QTextEdit, QComboBox { background-color: #1e40af; color: #cbd5e1; border: 1px solid #2563eb; }
        QListWidget, QTreeWidget { background-color: #1e40af; color: #cbd5e1; }
        QCheckBox::indicator:checked { background-color: #60a5fa; }
    """,
    "Red": """
        QWidget { background-color: #7f1d1d; color: #fca5a5; }
        QPushButton { background-color: #dc2626; border-radius: 5px; }
        QPushButton:hover { background-color: #ef4444; }
        QLineEdit, QTextEdit, QComboBox { background-color: #991b1b; color: #fca5a5; border: 1px solid #dc2626; }
        QListWidget, QTreeWidget { background-color: #991b1b; color: #fca5a5; }
        QCheckBox::indicator:checked { background-color: #f87171; }
    """,
    "Green": """
        QWidget { background-color: #14532d; color: #bbf7d0; }
        QPushButton { background-color: #16a34a; border-radius: 5px; }
        QPushButton:hover { background-color: #22c55e; }
        QLineEdit, QTextEdit, QComboBox { background-color: #166534; color: #bbf7d0; border: 1px solid #16a34a; }
        QListWidget, QTreeWidget { background-color: #166534; color: #bbf7d0; }
        QCheckBox::indicator:checked { background-color: #4ade80; }
    """,
    "Purple": """
        QWidget { background-color: #4c1d95; color: #d8b4fe; }
        QPushButton { background-color: #7c3aed; border-radius: 5px; }
        QPushButton:hover { background-color: #8b5cf6; }
        QLineEdit, QTextEdit, QComboBox { background-color: #5b21b6; color: #d8b4fe; border: 1px solid #7c3aed; }
        QListWidget, QTreeWidget { background-color: #5b21b6; color: #d8b4fe; }
        QCheckBox::indicator:checked { background-color: #c084fc; }
    """,
    "Solarized": """
        QWidget { background-color: #002b36; color: #93a1a1; }
        QPushButton { background-color: #268bd2; border-radius: 5px; }
        QPushButton:hover { background-color: #2aa198; }
        QLineEdit, QTextEdit, QComboBox { background-color: #073642; color: #93a1a1; border: 1px solid #268bd2; }
        QListWidget, QTreeWidget { background-color: #073642; color: #93a1a1; }
        QCheckBox::indicator:checked { background-color: #859900; }
    """,
    "Orange": """
        QWidget { background-color: #7c2d12; color: #fdba74; }
        QPushButton { background-color: #ea580c; border-radius: 5px; }
        QPushButton:hover { background-color: #f97316; }
        QLineEdit, QTextEdit, QComboBox { background-color: #9a3412; color: #fdba74; border: 1px solid #ea580c; }
        QListWidget, QTreeWidget { background-color: #9a3412; color: #fdba74; }
        QCheckBox::indicator:checked { background-color: #fb923c; }
    """,
    "Pink": """
        QWidget { background-color: #831843; color: #f9a8d4; }
        QPushButton { background-color: #db2777; border-radius: 5px; }
        QPushButton:hover { background-color: #ec4899; }
        QLineEdit, QTextEdit, QComboBox { background-color: #9d174d; color: #f9a8d4; border: 1px solid #db2777; }
        QListWidget, QTreeWidget { background-color: #9d174d; color: #f9a8d4; }
        QCheckBox::indicator:checked { background-color: #f472b6; }
    """,
    "Brown": """
        QWidget { background-color: #78350f; color: #fcd9b9; }
        QPushButton { background-color: #a16207; border-radius: 5px; }
        QPushButton:hover { background-color: #b45309; }
        QLineEdit, QTextEdit, QComboBox { background-color: #92400e; color: #fcd9b9; border: 1px solid #a16207; }
        QListWidget, QTreeWidget { background-color: #92400e; color: #fcd9b9; }
        QCheckBox::indicator:checked { background-color: #fbbf24; }
    """,
}
IMPORTANCE_COLORS = {
    0: QtGui.QColor(),  # None - default
    1: QtGui.QColor("#d0f0c0"),  # Low - light green
    2: QtGui.QColor("#fef3bd"),  # Medium - light yellow
    3: QtGui.QColor("#f4cccc"),  # High - light red
}
# ---------------- إدارة المستخدم ---------------- #
class UserManager:
    def __init__(self):
        self.users = {}
        self._load_users()

    def _load_users(self):
        try:
            if os.path.exists(USER_DATA_FILE):
                with open(USER_DATA_FILE, "r", encoding="utf-8") as f:
                    self.users = json.load(f)
            else:
                self.users = {}
        except Exception as e:
            QtWidgets.QMessageBox.critical(None, "Error", f"Failed loading users:\n{e}")
            self.users = {}

    def _save_users(self):
        try:
            with open(USER_DATA_FILE, "w", encoding="utf-8") as f:
                json.dump(self.users, f, indent=4)
        except Exception as e:
            QtWidgets.QMessageBox.critical(None, "Error", f"Failed saving users:\n{e}")

    def register(self, username, password):
        if username in self.users:
            return False, "Username already exists"
        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        self.users[username] = {"password": hashed, "profile_pic": None}
        self._save_users()
        return True, "Registration successful"

    def login(self, username, password):
        try:
            user = self.users.get(username)
            if not user:
                return False, "User not found"
            if bcrypt.checkpw(password.encode(), user["password"].encode()):
                return True, "Login successful"
            else:
                return False, "Invalid password"
        except Exception as e:
            return False, f"Login error: {e}"

    def set_profile_pic(self, username, path):
        if username in self.users:
            self.users[username]["profile_pic"] = path
            self._save_users()

    def get_profile_pic(self, username):
        user = self.users.get(username)
        if user:
            return user.get("profile_pic")
        return None

# ---------------- نموذج المهمة ---------------- #
class Task:
    def __init__(self, text, checked=False, importance=0, category="General", reminders=None):
        self.text = text
        self.checked = checked
        self.importance = importance  # 0-none, 1-low, 2-medium, 3-high
        self.category = category  # تصنيف المهمة
        self.reminders = reminders if reminders else []  # list of datetime strings

    def to_dict(self):
        return {
            "text": self.text,
            "checked": self.checked,
            "importance": self.importance,
            "category": self.category,
            "reminders": self.reminders,
        }

    @staticmethod
    def from_dict(data):
        return Task(
            data.get("text", ""),
            data.get("checked", False),
            data.get("importance", 0),
            data.get("category", "General"),
            data.get("reminders", []),
        )

# ---------------- مدير المهام ---------------- #
class TaskManager:
    def __init__(self, username):
        self.username = username
        self.file = f"tasks_{username}.json"
        self.tasks = []
        self.load_tasks()

    def load_tasks(self):
        try:
            if os.path.exists(self.file):
                with open(self.file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                self.tasks = [Task.from_dict(t) for t in data]
            else:
                self.tasks = []
        except Exception as e:
            QtWidgets.QMessageBox.critical(None, "Error", f"Failed loading tasks:\n{e}")
            self.tasks = []

    def save_tasks(self):
        try:
            with open(self.file, "w", encoding="utf-8") as f:
                json.dump([t.to_dict() for t in self.tasks], f, indent=4)
        except Exception as e:
            QtWidgets.QMessageBox.critical(None, "Error", f"Failed saving tasks:\n{e}")

    def add_task(self, task):
        self.tasks.append(task)

    def remove_task(self, task):
        if task in self.tasks:
            self.tasks.remove(task)

    def get_categories(self):
        cats = set(t.category for t in self.tasks)
        if not cats:
            cats.add("General")
        return sorted(cats)

    def tasks_in_category(self, category):
        return [t for t in self.tasks if t.category == category]

# ---------------- نافذة عرض الصورة بالبروفايل ---------------- #
class ProfilePicWindow(QtWidgets.QDialog):
    def __init__(self, pic_path):
        super().__init__()
        self.setWindowTitle("Profile Picture")
        self.pic_path = pic_path
        self.setMinimumSize(300, 300)
        self.resize(400, 400)
        self.init_ui()

    def init_ui(self):
        vbox = QtWidgets.QVBoxLayout()
        self.label = QtWidgets.QLabel()
        self.label.setAlignment(QtCore.Qt.AlignCenter)
        vbox.addWidget(self.label)

        btn_minimize = QtWidgets.QPushButton("Minimize")
        btn_minimize.clicked.connect(self.showMinimized)
        vbox.addWidget(btn_minimize)

        self.setLayout(vbox)
        self.load_image()

    def load_image(self):
        if self.pic_path and os.path.exists(self.pic_path):
            pixmap = QtGui.QPixmap(self.pic_path).scaled(self.size(), QtCore.Qt.KeepAspectRatio, QtCore.Qt.SmoothTransformation)
            self.label.setPixmap(pixmap)
        else:
            self.label.setText("No Image Found")

    def resizeEvent(self, event):
        self.load_image()
        super().resizeEvent(event)

# ---------------- نافذة التذكير ---------------- #
class ReminderDialog(QtWidgets.QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Set Reminder")
        self.setFixedSize(300, 150)

        vbox = QtWidgets.QVBoxLayout()

        self.time_edit = QtWidgets.QTimeEdit(QtCore.QTime.currentTime())
        self.time_edit.setDisplayFormat("HH:mm")
        self.date_edit = QtWidgets.QDateEdit(QtCore.QDate.currentDate())
        self.date_edit.setCalendarPopup(True)

        vbox.addWidget(QtWidgets.QLabel("Select reminder date:"))
        vbox.addWidget(self.date_edit)
        vbox.addWidget(QtWidgets.QLabel("Select reminder time:"))
        vbox.addWidget(self.time_edit)

        btn_box = QtWidgets.QHBoxLayout()
        btn_ok = QtWidgets.QPushButton("OK")
        btn_ok.clicked.connect(self.accept)
        btn_cancel = QtWidgets.QPushButton("Cancel")
        btn_cancel.clicked.connect(self.reject)
        btn_box.addWidget(btn_ok)
        btn_box.addWidget(btn_cancel)

        vbox.addLayout(btn_box)
        self.setLayout(vbox)

    def get_datetime(self):
        dt = QtCore.QDateTime(self.date_edit.date(), self.time_edit.time())
        return dt.toPyDateTime()

# ---------------- نافذة تسجيل الدخول ---------------- #
class LoginWindow(QtWidgets.QWidget):
    def __init__(self, user_manager):
        super().__init__()
        self.user_manager = user_manager
        self.setWindowTitle(f"{APP_NAME} - Login/Register")
        self.setFixedSize(400, 250)
        self.init_ui()

    def init_ui(self):
        layout = QtWidgets.QVBoxLayout()

        self.username_edit = QtWidgets.QLineEdit()
        self.username_edit.setPlaceholderText("Username")

        self.password_edit = QtWidgets.QLineEdit()
        self.password_edit.setPlaceholderText("Password")
        self.password_edit.setEchoMode(QtWidgets.QLineEdit.Password)

        self.info_label = QtWidgets.QLabel()
        self.info_label.setStyleSheet("color: red;")

        btn_layout = QtWidgets.QHBoxLayout()

        btn_login = QtWidgets.QPushButton(load_icon("sign-in"), "Login")
        btn_register = QtWidgets.QPushButton(load_icon("user-plus"), "Register")

        btn_login.clicked.connect(self.login)
        btn_register.clicked.connect(self.register)

        btn_layout.addWidget(btn_login)
        btn_layout.addWidget(btn_register)

        layout.addWidget(self.username_edit)
        layout.addWidget(self.password_edit)
        layout.addWidget(self.info_label)
        layout.addLayout(btn_layout)

        self.setLayout(layout)

    def login(self):
        username = self.username_edit.text().strip()
        password = self.password_edit.text()
        success, msg = self.user_manager.login(username, password)
        if success:
            self.info_label.setStyleSheet("color: green;")
            self.info_label.setText(msg)
            self.open_main(username)
        else:
            self.info_label.setStyleSheet("color: red;")
            self.info_label.setText(msg)

    def register(self):
        username = self.username_edit.text().strip()
        password = self.password_edit.text()
        success, msg = self.user_manager.register(username, password)
        if success:
            self.info_label.setStyleSheet("color: green;")
            self.info_label.setText(msg)
        else:
            self.info_label.setStyleSheet("color: red;")
            self.info_label.setText(msg)

    def open_main(self, username):
        self.main_win = MainWindow(username, self.user_manager)
        self.main_win.show()
        self.close()

# ---------------- النافذة الرئيسية ---------------- #
class MainWindow(QtWidgets.QMainWindow):
    reminder_check_interval = 60 * 1000  # 1 دقيقة بالميلي ثانية

    def __init__(self, username, user_manager):
        super().__init__()
        self.username = username
        self.user_manager = user_manager
        self.task_manager = TaskManager(username)
        self.current_theme = "Dark"
        self.profile_pic_path = self.user_manager.get_profile_pic(username)

        self.setWindowTitle(f"{APP_NAME} - {username}")
        self.resize(1000, 700)

        self.pic_enlarged = False
        self.reminder_timer = QtCore.QTimer()
        self.reminder_timer.timeout.connect(self.check_reminders)
        self.reminder_timer.start(self.reminder_check_interval)

        self.init_ui()
        self.apply_theme(self.current_theme)
        self.load_tasks_to_list()
        self.setup_tray()

    def init_ui(self):
        central_widget = QtWidgets.QWidget()
        main_layout = QtWidgets.QHBoxLayout()
        central_widget.setLayout(main_layout)
        self.setCentralWidget(central_widget)

        # جانبي: قائمة التصنيفات
        self.category_tree = QtWidgets.QTreeWidget()
        self.category_tree.setHeaderLabel("Categories")
        self.category_tree.setMaximumWidth(200)
        self.category_tree.itemClicked.connect(self.category_selected)
        main_layout.addWidget(self.category_tree)

        # اليمين: المهام والضوابط
        right_widget = QtWidgets.QWidget()
        right_vbox = QtWidgets.QVBoxLayout()
        right_widget.setLayout(right_vbox)
        main_layout.addWidget(right_widget)

        # أعلى: صورة البروفايل واسم المستخدم + تغيير الصورة
        top_layout = QtWidgets.QHBoxLayout()
        self.pic_label = QtWidgets.QLabel()
        self.pic_label.setFixedSize(80, 80)
        self.pic_label.setStyleSheet("border: 1px solid gray;")
        self.pic_label.setScaledContents(True)
        self.load_profile_pic()

        self.pic_label.mousePressEvent = self.enlarge_profile_pic  # الضغط على الصورة لتكبيرها

        btn_upload_pic = QtWidgets.QPushButton(load_icon("camera"), "Upload Picture")
        btn_upload_pic.clicked.connect(self.upload_profile_picture)

        top_layout.addWidget(self.pic_label)
        top_layout.addWidget(QtWidgets.QLabel(self.username))
        top_layout.addStretch()
        top_layout.addWidget(btn_upload_pic)
        right_vbox.addLayout(top_layout)

        # اختيار الثيم
        theme_layout = QtWidgets.QHBoxLayout()
        theme_layout.addWidget(QtWidgets.QLabel("Theme:"))
        self.theme_combo = QtWidgets.QComboBox()
        self.theme_combo.addItems(list(THEMES.keys()))
        self.theme_combo.setCurrentText(self.current_theme)
        self.theme_combo.currentTextChanged.connect(self.change_theme)
        theme_layout.addWidget(self.theme_combo)
        theme_layout.addStretch()
        right_vbox.addLayout(theme_layout)

        # شريط البحث
        self.search_edit = QtWidgets.QLineEdit()
        self.search_edit.setPlaceholderText("Search tasks (supports #hashtags)...")
        self.search_edit.textChanged.connect(self.load_tasks_to_list)
        right_vbox.addWidget(self.search_edit)

        # قائمة المهام
        self.task_list = QtWidgets.QListWidget()
        self.task_list.setSelectionMode(QtWidgets.QAbstractItemView.SingleSelection)
        self.task_list.itemChanged.connect(self.task_checked_changed)
        right_vbox.addWidget(self.task_list)

        # أزرار التحكم
        btn_layout = QtWidgets.QHBoxLayout()

        self.new_task_edit = QtWidgets.QLineEdit()
        self.new_task_edit.setPlaceholderText("New task here...")
        btn_layout.addWidget(self.new_task_edit)

        self.importance_combo = QtWidgets.QComboBox()
        self.importance_combo.addItems(["None", "Low", "Medium", "High"])
        self.importance_combo.setCurrentIndex(0)
        btn_layout.addWidget(QtWidgets.QLabel("Importance:"))
        btn_layout.addWidget(self.importance_combo)

        btn_add_task = QtWidgets.QPushButton(load_icon("plus"), "Add Task")
        btn_add_task.clicked.connect(self.add_task)
        btn_layout.addWidget(btn_add_task)

        btn_remove_task = QtWidgets.QPushButton(load_icon("trash"), "Remove Task")
        btn_remove_task.clicked.connect(self.remove_task)
        btn_layout.addWidget(btn_remove_task)

        btn_set_reminder = QtWidgets.QPushButton(load_icon("clock"), "Set Reminder")
        btn_set_reminder.clicked.connect(self.set_reminder)
        btn_layout.addWidget(btn_set_reminder)

        btn_export_excel = QtWidgets.QPushButton(load_icon("file-excel"), "Export Excel")
        btn_export_excel.clicked.connect(self.export_excel)
        btn_layout.addWidget(btn_export_excel)

        btn_export_pdf = QtWidgets.QPushButton(load_icon("file-pdf"), "Export PDF")
        btn_export_pdf.clicked.connect(self.export_pdf)
        btn_layout.addWidget(btn_export_pdf)

        btn_launch_toggl = QtWidgets.QPushButton(load_icon("clock"), "Launch Toggl")
        btn_launch_toggl.clicked.connect(self.launch_toggl)
        btn_layout.addWidget(btn_launch_toggl)

        right_vbox.addLayout(btn_layout)

    def load_profile_pic(self):
        if self.profile_pic_path and os.path.exists(self.profile_pic_path):
            pixmap = QtGui.QPixmap(self.profile_pic_path).scaled(80, 80, QtCore.Qt.KeepAspectRatio, QtCore.Qt.SmoothTransformation)
            self.pic_label.setPixmap(pixmap)
        else:
            icon = load_icon("user")
            self.pic_label.setPixmap(icon.pixmap(80, 80))

    def upload_profile_picture(self):
        try:
            path, _ = QtWidgets.QFileDialog.getOpenFileName(self, "Select Profile Picture", "", "Images (*.png *.jpg *.jpeg *.bmp)")
            if path:
                self.profile_pic_path = path
                self.user_manager.set_profile_pic(self.username, path)
                self.load_profile_pic()
        except Exception as e:
            QtWidgets.QMessageBox.warning(self, "Error", f"Failed to upload profile picture:\n{e}")

    def enlarge_profile_pic(self, event):
        if self.profile_pic_path and os.path.exists(self.profile_pic_path):
            self.pic_win = ProfilePicWindow(self.profile_pic_path)
            self.pic_win.show()

    def change_theme(self, theme):
        self.current_theme = theme
        self.apply_theme(theme)

    def apply_theme(self, theme):
        style = THEMES.get(theme, "")
        self.setStyleSheet(style)
    
    def add_task(self):
        text = self.new_task_edit.text().strip()
        if not text:
            return
        importance = self.importance_combo.currentIndex()
        category = self.get_selected_category() or "General"
        task = Task(text, checked=False, importance=importance, category=category)
        self.task_manager.add_task(task)
        self.task_manager.save_tasks()
        self.load_tasks_to_list()
        self.new_task_edit.clear()

    def remove_task(self):
        current_item = self.task_list.currentItem()
        if not current_item:
            return
        idx = self.task_list.row(current_item)
        # Remove from task manager list by matching visible filtered tasks
        filtered_tasks = self.get_filtered_tasks()
        if idx < 0 or idx >= len(filtered_tasks):
            return
        task_to_remove = filtered_tasks[idx]
        self.task_manager.remove_task(task_to_remove)
        self.task_manager.save_tasks()
        self.load_tasks_to_list()

    def load_tasks_to_list(self):
        self.task_list.blockSignals(True)  # لمنع حدث itemChanged داخل التحديث
        self.task_list.clear()

        filtered_tasks = self.get_filtered_tasks()

        for task in filtered_tasks:
            item = QtWidgets.QListWidgetItem(task.text)
            item.setFlags(item.flags() | QtCore.Qt.ItemIsUserCheckable)
            item.setCheckState(QtCore.Qt.Checked if task.checked else QtCore.Qt.Unchecked)
            # أهمية المهمة لون الخلفية
            color = IMPORTANCE_COLORS.get(task.importance)
            if color.isValid():
                item.setBackground(color)
            self.task_list.addItem(item)

        self.task_list.blockSignals(False)

    def get_selected_category(self):
        selected_items = self.category_tree.selectedItems()
        if selected_items:
            return selected_items[0].text(0)
        return None

    def category_selected(self, item, column):
        self.load_tasks_to_list()

    def filter_text(self):
        return self.search_edit.text().strip().lower()

    def get_filtered_tasks(self):
        category = self.get_selected_category()
        filter_text = self.filter_text()
        tasks = self.task_manager.tasks_in_category(category) if category else self.task_manager.tasks

        if filter_text:
            filtered = []
            for t in tasks:
                # دعم الهاشتاغات #tag في البحث
                task_text_lower = t.text.lower()
                if filter_text in task_text_lower:
                    filtered.append(t)
                else:
                    # تحقق من وجود الهاشتاغات في النص
                    hashtags = [word for word in task_text_lower.split() if word.startswith("#")]
                    if any(filter_text == tag for tag in hashtags):
                        filtered.append(t)
            return filtered
        return tasks

    def task_checked_changed(self, item):
        idx = self.task_list.row(item)
        filtered_tasks = self.get_filtered_tasks()
        if idx < 0 or idx >= len(filtered_tasks):
            return
        task = filtered_tasks[idx]
        task.checked = (item.checkState() == QtCore.Qt.Checked)
        self.task_manager.save_tasks()

    def set_reminder(self):
        current_item = self.task_list.currentItem()
        if not current_item:
            return
        idx = self.task_list.row(current_item)
        filtered_tasks = self.get_filtered_tasks()
        if idx < 0 or idx >= len(filtered_tasks):
            return

        task = filtered_tasks[idx]

        dlg = ReminderDialog(self)
        if dlg.exec_() == QtWidgets.QDialog.Accepted:
            dt = dlg.get_datetime()
            # فقط المستقبل، تأكد من صحة المدخل
            if dt <= datetime.datetime.now():
                QtWidgets.QMessageBox.warning(self, "Invalid time", "Please select a future date/time for reminder.")
                return
            dt_str = dt.strftime("%Y-%m-%d %H:%M:%S")
            task.reminders.append(dt_str)
            self.task_manager.save_tasks()
            QtWidgets.QMessageBox.information(self, "Reminder Set", f"Reminder for task '{task.text}' set at {dt_str}")

    def check_reminders(self):
        now = datetime.datetime.now()
        changed = False
        for task in self.task_manager.tasks:
            for rem in task.reminders[:]:
                try:
                    rem_dt = datetime.datetime.strptime(rem, "%Y-%m-%d %H:%M:%S")
                    if rem_dt <= now:
                        notification.notify(
                            title="Task Reminder",
                            message=f"Reminder for task: {task.text}",
                            app_name=APP_NAME,
                            timeout=10,
                        )
                        task.reminders.remove(rem)
                        changed = True
                except Exception:
                    traceback.print_exc()
        if changed:
            self.task_manager.save_tasks()
            self.load_tasks_to_list()

    def export_excel(self):
        path, _ = QtWidgets.QFileDialog.getSaveFileName(self, "Export Tasks to Excel", filter="Excel Files (*.xlsx)")
        if not path:
            return
        try:
            wb = Workbook()
            ws = wb.active
            ws.title = "Tasks"
            ws.append(["Task", "Completed", "Importance", "Category", "Reminders"])
            imp_map = {0: "None", 1: "Low", 2: "Medium", 3: "High"}
            for task in self.get_filtered_tasks():
                ws.append([task.text, str(task.checked), imp_map.get(task.importance, "None"), task.category, "; ".join(task.reminders)])
            wb.save(path)
            QtWidgets.QMessageBox.information(self, "Export Excel", f"Tasks exported successfully to {path}")
        except Exception as e:
            QtWidgets.QMessageBox.warning(self, "Export Excel", f"Failed to export tasks:\n{e}")

    def export_pdf(self):
        path, _ = QtWidgets.QFileDialog.getSaveFileName(self, "Export Tasks to PDF", filter="PDF Files (*.pdf)")
        if not path:
            return
        try:
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("Arial", size=12)
            pdf.cell(0, 10, f"Tasks for {self.username}", ln=True, align="C")
            imp_map = {0: "None", 1: "Low", 2: "Medium", 3: "High"}
            for task in self.get_filtered_tasks():
                status = "[X]" if task.checked else "[ ]"
                pdf.cell(0, 10, f"{status} {task.text} (Importance: {imp_map.get(task.importance, 'None')}, Category: {task.category})", ln=True)
                if task.reminders:
                    pdf.set_font("Arial", style="I", size=10)
                    pdf.cell(0, 8, "Reminders: " + ", ".join(task.reminders), ln=True)
                    pdf.set_font("Arial", size=12)
            pdf.output(path)
            QtWidgets.QMessageBox.information(self, "Export PDF", f"Tasks exported successfully to {path}")
        except Exception as e:
            QtWidgets.QMessageBox.warning(self, "Export PDF", f"Failed to export tasks:\n{e}")

    def setup_tray(self):
        self.tray = QtWidgets.QSystemTrayIcon(self)
        icon = load_icon("check-square")
        self.tray.setIcon(icon)
        tray_menu = QtWidgets.QMenu()

        open_action = tray_menu.addAction("Open")
        quit_action = tray_menu.addAction("Exit")

        open_action.triggered.connect(self.showNormal)
        quit_action.triggered.connect(QtWidgets.qApp.quit)

        self.tray.setContextMenu(tray_menu)
        self.tray.show()
        self.tray.activated.connect(self.tray_activated)

    def tray_activated(self, reason):
        if reason == QtWidgets.QSystemTrayIcon.Trigger:
            self.showNormal()

    def closeEvent(self, event):
        self.tray.hide()
        event.accept()

    def launch_toggl(self):
        try:
            if os.name == "nt":
                toggl_path = os.path.expandvars(TOGGL_PATH)
                if not os.path.exists(toggl_path):
                    QtWidgets.QMessageBox.warning(self, "Toggl Track", f"Toggl Track app not found at:\n{toggl_path}")
                    return
                subprocess.Popen([toggl_path])
            else:
                QtWidgets.QMessageBox.information(self, "Toggl Track", "Launching Toggl Track is supported only on Windows.")
        except Exception as e:
            QtWidgets.QMessageBox.warning(self, "Toggl Track", f"Failed to launch Toggl Track:\n{e}")

# -------------- تشغيل التطبيق --------------
def main():
    app = QtWidgets.QApplication(sys.argv)
    user_manager = UserManager()
    login_win = LoginWindow(user_manager)
    login_win.show()
    sys.exit(app.exec_())


if __name__ == "__main__":
    main()
