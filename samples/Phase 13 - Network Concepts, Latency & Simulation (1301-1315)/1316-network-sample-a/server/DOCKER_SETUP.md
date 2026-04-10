# Setting Up Docker via VS Code Extensions

This guide covers how to install, configure, and manage Docker entirely through the Visual Studio Code interface.

## 1. Install the Official Extension
1. Open **VS Code**.
2. Go to the **Extensions** view (`Ctrl+Shift+X`).
3. Search for **"Docker"** (published by Microsoft).
4. Click **Install**.

## 2. System Installation via VS Code
If Docker is not yet installed on your computer, the extension provides shortcuts:
* **The Whale Icon:** Click the Docker icon in the Activity Bar. If Docker isn't found, it will display a button: **"Get Docker Desktop"**.
* **Command Palette:** Press `Ctrl+Shift+P` and type `Docker: Help`. This will lead you to official documentation for your specific OS.

> **Note:** You must still run the Docker Desktop installer once it downloads to enable the background engine.

## 3. Configure Your Project
You don't need to write a `Dockerfile` manually. The extension can do it for you:
1. Open your project folder in VS Code.
2. Press `Ctrl+Shift+P` and type **"Docker: Add Docker Files to Workspace"**.
3. Select your application platform (Node.js, Python, Go, etc.).
4. Choose the port your app uses.
5. The extension will automatically generate:
   - `Dockerfile`
   - `.dockerignore`
   - `docker-compose.yml` (optional)

## 4. Managing Containers (No Terminal Required)
Use the **Docker Tab** (Whale Icon) in the sidebar to manage your workflow visually:


| Task | Action in VS Code |
| :--- | :--- |
| **Build Image** | Right-click your `Dockerfile` in the Explorer -> **Build Image**. |
| **Run Container** | In the **Images** pane, right-click an image -> **Run**. |
| **Stop/Restart** | In the **Containers** pane, right-click a running container -> **Stop** or **Restart**. |
| **View Logs** | Right-click a container -> **View Logs** (opens a dedicated output window). |
| **Enter Terminal** | Right-click a container -> **Attach Shell** (opens a terminal *inside* the container). |

## 5. Pro Tip: Dev Containers
For a "Zero-Install" local setup, install the **Dev Containers** extension.
1. Press `Ctrl+Shift+P` -> **Dev Containers: Add Dev Container Configuration Files...**
2. Choose your tech stack.
3. VS Code will prompt you to **"Reopen in Container"**. 
4. Your entire VS Code environment (extensions, themes, and tools) will now run inside Docker.
