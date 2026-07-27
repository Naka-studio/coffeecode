import "./style.scss";
import fsOperation from "fileSystem";

const SIDEBAR_ID = "source-control";
const SIDEBAR_ICON = "codicon codicon-source-control";
const SIDEBAR_TITLE = "Source Control";

async function checkGitRepo(folderUrl) {
	try {
		return await fsOperation(folderUrl + "/.git").exists();
	} catch {
		return false;
	}
}

async function checkGitRemote() {
	try {
		const config = await fsOperation(
			window.addedFolder?.[0]?.url + "/.git/config",
		).readFile("utf-8");
		return config.includes("[remote");
	} catch {
		return false;
	}
}

function renderError(container, icon, title, message) {
	container.innerHTML = "";
	const $error = (
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
		</div>
	);
	container.append($error);
}

async function init(container) {
	const $wrapper = <div className="source-control-sidebar" />;
	container.append($wrapper);

	// Cek folder aktif
	const folderUrl = window.addedFolder?.[0]?.url;

	if (!folderUrl) {
		renderError(
			$wrapper,
			"codicon-folder-opened",
			"No Folder Opened",
			"Open a folder first to use Source Control.",
		);
		return;
	}

	// Listen ketika folder dibuka
	window.addEventListener("folder-added", async () => {
		$wrapper.innerHTML = "";
		await init(container);
	});

	// Cek git repo
	const isRepo = await checkGitRepo(folderUrl);
	if (!isRepo) {
		renderError(
			$wrapper,
			"codicon-git-commit",
			"Not a Git Repository",
			"This folder is not a git repository. Initialize one in Source Control Page.",
		);
		return;
	}

	// Cek git remote
	const hasRemote = await checkGitRemote();
	if (!hasRemote) {
		renderError(
			$wrapper,
			"codicon-remote",
			"No Remote Repository",
			"No remote repository found. Add one in Source Control Page.",
		);
		return;
	}

	// Render dashboard normal
	const $projectName = <span id="sc-project-name">—</span>;
	const $branchName = <span id="sc-branch-name">—</span>;
	const $changesCount = <span id="sc-changes-count"></span>;
	const $fileList = <div id="sc-file-list"></div>;
	const $ahead = <span id="sc-ahead">0</span>;
	const $behind = <span id="sc-behind">0</span>;

	const $el = (
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
		</div>
	);

	// Sync project
	function updateProject() {
		const activeFile = window.editorManager?.activeFile;
		if (activeFile) {
			const folderName = folderUrl.split("/").pop() || "—";
			$projectName.textContent = folderName;
		}
	}

	// Update changes
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

	updateProject();
	updateChanges([
		{ status: "M", name: "index.html" },
		{ status: "M", name: "style.css" },
		{ status: "?", name: "assets/logo.svg" },
	]);

	window.editorManager?.on("switch-file", updateProject);
	$wrapper.append($el);

	return () => {
		window.editorManager?.off("switch-file", updateProject);
	};
}

export default [SIDEBAR_ICON, SIDEBAR_ID, SIDEBAR_TITLE, init];
