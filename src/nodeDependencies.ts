import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class DepNodeProvider implements vscode.TreeDataProvider<Dependency> {
  private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> =this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string | undefined) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }
  getChildren(element?: Dependency): Thenable<Dependency[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("No dependency in Empty Workspace");
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve(
        this.getDepsInPackageJson(
          path.join(
            this.workspaceRoot,
            "node_modules",
            element.label,
            "package.json"
          )
        )
      );
    } else {
      const packageJsonPath = path.join(this.workspaceRoot, "package.json");
      if (this.pathExists(packageJsonPath)) {
        return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
      } else {
        vscode.window.showInformationMessage("Workspace has no package.json");
        return Promise.resolve([]);
      }
    }
  }

  //Given the path to a package.json, read all its dependencies and devDependencies

  private getDepsInPackageJson(packageJsonPath: string): Dependency[] {
    const worskpaceRoot = this.workspaceRoot;
    if (this.pathExists(packageJsonPath) && worskpaceRoot) {
        //the object of the string of packages obtained from package.json file
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      console.log("the Package Json is ",JSON.stringify(packageJson,null, 2));

      const toDep = (moduleName: string, version: string): Dependency => {
        if (
          this.pathExists(path.join(worskpaceRoot, "node_modules", moduleName))
        ) {
          return new Dependency(
            moduleName,
            version,
            vscode.TreeItemCollapsibleState.Collapsed
          );
        } else {
          return new Dependency(
            moduleName,
            version,
            vscode.TreeItemCollapsibleState.None,
            {
              command: "extension.openPackageOnNpm",
              title: "",
              arguments: [moduleName],
            }
          );
        }
      };

      const deps = packageJson.dependencies
        ? Object.keys(packageJson.dependencies).map((dep) =>
            toDep(dep, packageJson.dependencies[dep])
          )
        : [];

      const devDeps = packageJson.devDependencies
        ? Object.keys(packageJson.devDependencies).map((dep) =>
            toDep(dep, packageJson.devDependencies[dep])
          )
        : [];

      return deps.concat(devDeps);
    } else {
      return [];
    }
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch {
      return false;
    }
    return true;
  }
}

export class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private readonly version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.label}-${this.version}`;
    this.description = this.version;
  }

  iconPath = {
    light: vscode.Uri.file(
      path.join(__filename, "..", "..", "resources", "light", "dependency.svg")
    ),
    dark: vscode.Uri.file(
      path.join(__filename, "..", "..", "resources", "dark", "dependency.svg")
    ),
  };

  contextValue = "dependency";
}
