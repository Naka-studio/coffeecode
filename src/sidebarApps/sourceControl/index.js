import "./style.scss";
import fsOperation from "fileSystem";
import Url from "utils/Url";

const SIDEBAR_ID = "source-control";
const SIDEBAR_ICON = "codicon codicon-source-control";
const SIDEBAR_TITLE = "Source Control";

// ============================================================
// Auth check — placeholder, nanti connect ke auth system
// ============================================================
function isUserLoggedIn() {
  // TODO: connect ke auth system CF Code
  // Sementara return true biar gak block development
  return true;
}

// ============================================================
// Git checks
// ============================================================
async function checkGitRepo(folderUrl) {
  try {
    return await fsOperation(Url.join(folderUrl, ".git")).exists();
  } catch {
    return false;
  }
}

async function checkGitRemote(folderUrl) {
  try {
    const configUrl = Url.join(folderUrl, ".git", "config");
    const config = await fsOperation(configUrl).readFile("utf-8");
    return config.includes("[remote");
  } catch {
    return false;
  }
}

// ============================================================
// Render error state
// ============================================================
function renderError(container, icon, title, message) {
  container.innerHTML = "";
  container.append(
    <div className="sc-error-state">
      <span className={`codicon ${icon} sc-error-icon`} />
      <div className="sc-error-title">{title}</div>
      <div className="sc-error-message">{message}</div>
      <button
        className="sc-open-btn"
        onclick={() => acode.exec("open-source-control")}
      >
        Open Source Control
      </button>
    </div>,
  );
}

// ============================================================
// Render dashboard normal
// ============================================================
function renderDashboard(container, folderUrl, projectName) {
  container.innerHTML = "";

  const $projectName = <span>{projectName}</span>;
  const $branchName = <span>—</span>;
  const $changesCount = <span></span>;
  const $fileList = <div className="sc-file-list"></div>;
  const $ahead = <span>0</span>;
  const $behind = <span>0</span>;

  container.append(
    <div className="sc-content">
      <div className="sc-header">
        <span className="codicon codicon-source-control sc-header-icon" />
        <span className="sc-header-title">Source Control</span>
      </div>

      <div className="sc-divider" />

      <div className="sc-section">
        <div className="sc-section-title">Project Active</div>
        <div className="sc-project">
          <span className="codicon codicon-folder sc-project-icon" />
          {$projectName}
        </div>
      </div>

      <div className="sc-section">
        <div className="sc-section-title">Branch</div>
        <div className="sc-branch">
          <span className="codicon codicon-git-branch" />
          {$branchName}
        </div>
      </div>

      <div className="sc-divider" />

      <div className="sc-section sc-changes-section">
        <div className="sc-section-title">Changes {$changesCount}</div>
        {$fileList}
      </div>

      <div className="sc-bottom">
        <div className="sc-divider" />
        <div className="sc-sync-status">
          <span className="sc-sync-item">
            <span className="codicon codicon-arrow-up" />
            {$ahead}
          </span>
          <span className="sc-sync-item">
            <span className="codicon codicon-arrow-down" />
            {$behind}
          </span>
        </div>
        <button
          className="sc-open-btn"
          onclick={() => acode.exec("open-source-control")}
        >
          Open Source Control
        </button>
      </div>
    </div>,
  );
}

// ============================================================
// Main init
// ============================================================
function getActiveFolder() {
  const activeFile = window.editorManager?.activeFile;
  const uri = activeFile?.uri;

  if (!uri) return window.addedFolder?.[0] || null;

  for (const folder of window.addedFolder || []) {
    if (typeof folder?.url === "string" && uri.startsWith(folder.url)) {
      return folder;
    }
  }

  return window.addedFolder?.[0] || null;
}

async function init(container) {
  const $wrapper = <div className="source-control-sidebar" />;
  container.append($wrapper);

  async function refresh() {
    $wrapper.innerHTML = "";

    // Step 1 - cek file/folder active
    const activeFolder = getActiveFolder();
    const folderUrl = activeFolder?.url;
    const projectName =
      activeFolder?.title || folderUrl?.split("/").pop() || "—";
    console.log("SC Step 1 - folderUrl:", folderUrl);
    if (!folderUrl) {
      renderError(
        $wrapper,
        "codicon-folder-opened",
        "No Folder Opened",
        "Open a folder first to use Source Control.",
      );
      return;
    }

    // Step 2 - cek apakah user sudah login/belom
    console.log("SC Step 2 - checking login");
    if (!isUserLoggedIn()) {
      renderError(
        $wrapper,
        "codicon-account",
        "Not Logged In",
        "Please login to use Source Control.",
      );
      return;
    }

    // Step 3 - cek ada git atau tidak
    console.log("SC Step 3 - checking git repo");
    try {
      const isRepo = await checkGitRepo(folderUrl);
      console.log("SC Step 3 - isRepo:", isRepo);
      if (!isRepo) {
        renderError(
          $wrapper,
          "codicon-git-commit",
          "Not a Git Repository",
          "This folder is not a git repository.",
        );
        return;
      }
    } catch (e) {
      console.log("SC Step 3 - error:", e.message);
      renderError($wrapper, "codicon-warning", "Error checking git", e.message);
      return;
    }

    // Step 4 - Check Ada git Remote / tidak
    console.log("SC Step 4 - checking remote");
    try {
      const hasRemote = await checkGitRemote(folderUrl);
      console.log("SC Step 4 - hasRemote:", hasRemote);
      if (!hasRemote) {
        renderError(
          $wrapper,
          "codicon-remote",
          "No Remote Repository",
          "No remote repository found.",
        );
        return;
      }
    } catch (e) {
      console.log("SC Step 4 - error:", e.message);
      renderError(
        $wrapper,
        "codicon-warning",
        "Error checking remote",
        e.message,
      );
      return;
    }

    // Step 5 - Render Dashboard
    console.log("SC Step 5 - rendering dashboard");
    renderDashboard($wrapper, folderUrl, projectName);
  }

  // Auto refresh listeners
  window.editorManager?.on("add-folder", refresh);
  window.editorManager?.on("remove-folder", refresh);
  window.editorManager?.on("switch-file", refresh);

  // Initial check
  await refresh();

  // Cleanup
  return () => {
    window.editorManager?.off("add-folder", refresh);
    window.editorManager?.off("remove-folder", refresh);
    window.editorManager?.off("switch-file", refresh);
  };
}

export default [SIDEBAR_ICON, SIDEBAR_ID, SIDEBAR_TITLE, init];
