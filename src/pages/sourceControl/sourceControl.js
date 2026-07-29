import "./style.scss";
import Page from "components/page";
import Url from "utils/Url";
import fsOperation from "fileSystem";

export default function SourceControlPage() {
  const $page = Page("Source Control");

  async function init() {
    const folderUrl = window.addedFolder?.[0]?.url;

    if (!folderUrl) {
      $page.append(
        <div className="sc-page-empty">
          <span className="codicon codicon-source-control sc-page-empty-icon" />
          <div className="sc-page-empty-title">No Folder Opened</div>
          <div className="sc-page-empty-msg">Open a folder to use Source Control.</div>
        </div>
      );
      return;
    }

    const isRepo = await checkGitRepo(folderUrl);

    if (!isRepo) {
      $page.append(
        <div className="sc-page-empty">
          <span className="codicon codicon-git-commit sc-page-empty-icon" />
          <div className="sc-page-empty-title">Not a Git Repository</div>
          <div className="sc-page-empty-msg">Initialize a git repository to get started.</div>
          <button className="sc-page-btn-primary" onclick={() => {}}>
            Initialize Repository
          </button>
        </div>
      );
      return;
    }

    renderPage(folderUrl);
  }

  async function checkGitRepo(folderUrl) {
    try {
      const entries = await fsOperation(folderUrl).lsDir();
      return entries.some(e => e.name === ".git");
    } catch {
      return false;
    }
  }

  function renderPage(folderUrl) {
    const projectName = window.addedFolder?.[0]?.title || "—";

    $page.append(
      <div className="sc-page">

        {/* Header info */}
        <div className="sc-page-section">
          <div className="sc-page-label">Project</div>
          <div className="sc-page-value">
            <span className="codicon codicon-folder" />
            {projectName}
          </div>
        </div>

        <div className="sc-page-divider" />

        {/* Changes */}
        <div className="sc-page-section">
          <div className="sc-page-section-header">
            <div className="sc-page-label">Changes</div>
          </div>
          <div id="sc-page-changes">
            <div className="sc-page-empty-msg">No changes detected.</div>
          </div>
        </div>

        <div className="sc-page-divider" />

        {/* Commit */}
        <div className="sc-page-section">
          <div className="sc-page-label">Commit</div>
          <textarea
            id="sc-commit-msg"
            className="sc-page-textarea"
            placeholder="Commit message..."
          />
          <button className="sc-page-btn-primary" onclick={() => {}}>
            <span className="codicon codicon-git-commit" /> Commit
          </button>
        </div>

        <div className="sc-page-divider" />

        {/* Sync */}
        <div className="sc-page-section">
          <div className="sc-page-label">Sync</div>
          <div className="sc-page-sync">
            <div className="sc-page-sync-status">
              <span className="codicon codicon-arrow-up" /> <span id="sc-ahead">0</span>
              <span className="codicon codicon-arrow-down" /> <span id="sc-behind">0</span>
            </div>
            <div className="sc-page-sync-actions">
              <button className="sc-page-btn-primary" onclick={() => {}}>
                <span className="codicon codicon-cloud-upload" /> Push
              </button>
              <button className="sc-page-btn-secondary" onclick={() => {}}>
                <span className="codicon codicon-cloud-download" /> Pull
              </button>
            </div>
          </div>
        </div>

        <div className="sc-page-divider" />

        {/* History */}
        <div className="sc-page-section">
          <div className="sc-page-label">History</div>
          <div id="sc-history">
            <div className="sc-page-empty-msg">No commits yet.</div>
          </div>
        </div>

        <div className="sc-page-divider" />

        {/* Branch */}
        <div className="sc-page-section">
          <div className="sc-page-label">Branches</div>
          <div id="sc-branches">
            <div className="sc-page-empty-msg">Loading branches...</div>
          </div>
          <button className="sc-page-btn-secondary" onclick={() => {}}>
            <span className="codicon codicon-git-branch" /> New Branch
          </button>
        </div>

        <div className="sc-page-divider" />

        {/* Repo Settings */}
        <div className="sc-page-section">
          <div className="sc-page-label">Repository</div>
          <button className="sc-page-btn-secondary" onclick={() => {}}>
            <span className="codicon codicon-remote" /> Manage Remote
          </button>
        </div>

      </div>
    );
  }

  init();
  return $page;
}