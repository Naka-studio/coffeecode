import "./style.scss";

const SIDEBAR_ID = "source-control";
const SIDEBAR_ICON = "codicon codicon-source-control";
const SIDEBAR_TITLE = "Source Control";

async function init(container) {
  let refreshInterval = null;

  const $projectName = <span id="sc-project-name">—</span>;
  const $branchName = <span id="sc-branch-name">—</span>;
  const $changesCount = <span id="sc-changes-count"></span>;
  const $fileList = <div id="sc-file-list"></div>;
  const $ahead = <span id="sc-ahead">0</span>;
  const $behind = <span id="sc-behind">0</span>;

  const $el = (
    <div className="source-control-sidebar">

      {/* Header */}
      <div className="sc-header">
        <span className="codicon codicon-source-control sc-header-icon" />
        <span className="sc-header-title">Source Control</span>
      </div>

      <div className="sc-divider" />

      {/* Project Active */}
      <div className="sc-section">
        <div className="sc-section-title">Project Active</div>
        <div className="sc-project">
          <span className="codicon codicon-folder sc-project-icon" />
          {$projectName}
        </div>
      </div>

      {/* Branch */}
      <div className="sc-section">
        <div className="sc-section-title">Branch</div>
        <div className="sc-branch">
          <span className="codicon codicon-git-branch" />
          {$branchName}
        </div>
      </div>

      <div className="sc-divider" />

      {/* Changes */}
      <div className="sc-section sc-changes-section">
        <div className="sc-section-title">
          Changes {$changesCount}
        </div>
        {$fileList}
      </div>

      {/* Sticky bottom */}
      <div className="sc-bottom">
        <div className="sc-divider" />

        {/* Sync status */}
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

    </div>
  );

  // Sync project dengan active file di editor
  function updateProject() {
    const activeFile = window.editorManager?.activeFile;
    if (activeFile) {
      const name = activeFile.filename || activeFile.name || "—";
      const parts = name.split("/");
      $projectName.textContent = parts[parts.length - 1] || "—";
    } else {
      $projectName.textContent = "—";
    }
  }

  // Update file changes (placeholder — nanti connect ke git)
  function updateChanges(files = []) {
    $fileList.innerHTML = "";
    $changesCount.textContent = files.length ? `(${files.length})` : "";

    files.forEach(({ status, name }) => {
      const $item = (
        <div className={`sc-file-item ${status === "?" ? "untracked" : ""}`}>
          <span className="sc-file-status">{status}</span>
          <span className="sc-file-name">{name}</span>
        </div>
      );
      $fileList.append($item);
    });
  }

  // Init
  updateProject();
  updateChanges([
    { status: "M", name: "index.html" },
    { status: "M", name: "style.css" },
    { status: "?", name: "assets/logo.svg" },
  ]);

  // Listen active file change
  window.editorManager?.on("switch-file", updateProject);

  container.append($el);

  // Cleanup
  return () => {
    window.editorManager?.off("switch-file", updateProject);
    if (refreshInterval) clearInterval(refreshInterval);
  };
}

export default [SIDEBAR_ICON, SIDEBAR_ID, SIDEBAR_TITLE, init];