# Deploying Kolkata 2050 to GitHub Pages for Meta Quest 3S

This project is fully configured for **GitHub Pages** deployment and **WebXR on Meta Quest 3S / Meta Quest 3 / Quest 2 / Quest Pro**.

---

## 🚀 Option 1: Automatic Deployment with GitHub Actions (Recommended)

The repository already includes `.github/workflows/deploy.yml`. Every time you push to the `main` or `master` branch, GitHub will automatically build and deploy your site to GitHub Pages!

### Step 1: Initialize Git and Push to GitHub

1. Create a new repository on [GitHub](https://github.com/new) (e.g. `kolkata-2050-vr`).
2. In your local project directory, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Kolkata 2050 WebXR project"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git push -u origin main
   ```

### Step 2: Enable GitHub Actions Deployment in Repo Settings

1. Open your repository on GitHub.
2. Go to **Settings** > **Pages** (in the left sidebar).
3. Under **Build and deployment** > **Source**, choose **GitHub Actions**.
4. The workflow will automatically trigger! Go to the **Actions** tab to watch it build and deploy.
5. Once finished, your site will be live at:
   `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`

---

## 🛠️ Option 2: Manual Deployment via `npm run deploy`

If you prefer deploying via the `gh-pages` branch:

1. Run:
   ```bash
   npm run deploy
   ```
2. In GitHub repository **Settings** > **Pages**:
   - Source: **Deploy from a branch**
   - Branch: **`gh-pages`** / Folder: `/(root)`
   - Click **Save**.

---

## 🥽 How to Test on Meta Quest 3S

Meta Quest 3S features the **Meta Quest Browser**, which natively supports **WebXR (WebGL2 + 6DoF Roomscale)** over HTTPS (provided automatically by GitHub Pages).

### Step 1: Open the URL in Headset
1. Put on your Meta Quest 3S headset.
2. Open the **Meta Quest Browser** from the app library.
3. In the URL address bar, enter your GitHub Pages URL:
   `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`
   *(Tip: You can also use the Meta Quest Mobile App on your phone to send the URL directly to your headset: open the link on your phone, tap share, and select "Send to Meta Quest").*

### Step 2: Enter WebXR Immersive Mode
1. Once the page loads, you will see the glowing cyan **"ENTER VR"** or **"ENTER QUEST 3S VR"** button at the top right.
2. Click the button using your Touch Plus controller laser pointer.
3. The Meta Quest Browser will prompt: *"Allow immersive VR session?"*
4. Click **Allow**.
5. You are now inside the 3D virtual environment of Kolkata in 2050 in full 6DoF stereoscopic VR!

---

## 🎮 Meta Quest 3S Touch Plus Controller Controls

| Controller Action | Function |
|---|---|
| **Left Thumbstick (Push Forward/Back/Strafe)** | Smooth locomotion through streets and promenades |
| **Right Thumbstick (Flick Left/Right)** | 45° Snap turning for comfortable, nausea-free rotation |
| **Right Trigger / Left Trigger (Point Laser)** | Point at holographic beacons or ground and press to teleport / inspect STEM data |
| **A / X Buttons** | Advance to next 2050 scenario (Monsoon Floods, Heatwave, Autonomous Transit, Night Spectacle) |
| **B / Y Buttons** | Go back to previous scenario or dismiss holographic panels |
| **Grip Button** | Steady raycast line |

---

## ⚙️ Why Vite Configuration Works Seamlessly on GitHub Pages

1. **Relative Base Path**: `vite.config.ts` is configured with `base: './'`. This ensures all JavaScript bundles, CSS stylesheets, and 3D concept photo assets load correctly from `https://<username>.github.io/<repo-name>/` without 404 path errors.
2. **HTTPS Enforced**: GitHub Pages provides free SSL/TLS certificates. WebXR strictly requires HTTPS for `navigator.xr.requestSession('immersive-vr')`.
3. **No Backend Required for VR**: The entire 3D simulation, spatial audio engine, scenario controllers, and holographic UI run entirely client-side on Three.js & WebXR.
