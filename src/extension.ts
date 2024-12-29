import * as vscode from 'vscode';
import { Dependency, DepNodeProvider } from './nodeDependencies';
import { JsonOutlineProvider } from './jsonOutline';
import { TestViewDragAndDrop } from './testViewDragAndDrop';
import { TestView } from './testView';
import { SymbolListDragAndDrop, SymbolListProvider } from './foundSymbolsforDocs';

export function activate(context:vscode.ExtensionContext){
  const rootPath =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : undefined;

  const nodeDependenciesProvider = new DepNodeProvider(rootPath);
  vscode.commands.registerCommand('nodeDependencies.refreshEntry',()=> nodeDependenciesProvider.refresh());
  vscode.commands.registerCommand("extension.openPackageOnNpm", (moduleName) =>vscode.commands.executeCommand("vscode.open",vscode.Uri.parse(`https://www.npmjs.com/package/${moduleName}`)));
  vscode.commands.registerCommand('nodeDependencies.addEntry',()=>vscode.window.showInformationMessage(`Successfully called  add Entry.`));
  vscode.commands.registerCommand('nodeDependencies.editEntry',(node:Dependency) => vscode.window.showInformationMessage(`Successfully called  edit Entry on ${node.label}.`));
 	vscode.commands.registerCommand('nodeDependencies.deleteEntry', (node: Dependency) => vscode.window.showInformationMessage(`Successfully called delete entry on ${node.label}.`));
   // Subscribe to the onDidChangeTreeData event
  nodeDependenciesProvider.onDidChangeTreeData(() => {
    // Refresh the tree view to show the changes
    vscode.window.createTreeView("nodeDependencies", {
      treeDataProvider: nodeDependenciesProvider,
    });
  });
  vscode.window.registerTreeDataProvider(
    "nodeDependencies",
    nodeDependenciesProvider
  );
  vscode.window.createTreeView("nodeDependencies", {
    treeDataProvider: nodeDependenciesProvider,
  });

  const jsonOutlineProvider = new JsonOutlineProvider(context);
	vscode.window.registerTreeDataProvider('jsonOutline', jsonOutlineProvider);
	vscode.commands.registerCommand('jsonOutline.refresh', () => jsonOutlineProvider.refresh());
	vscode.commands.registerCommand('jsonOutline.refreshNode', offset => jsonOutlineProvider.refresh(offset));
	vscode.commands.registerCommand('jsonOutline.renameNode', args => {
		let offset = undefined;
		if (args.selectedTreeItems && args.selectedTreeItems.length) {
			offset = args.selectedTreeItems[0];
		} else if (typeof args === 'number') {
			offset = args;
		}
		if (offset) {
			jsonOutlineProvider.rename(offset);
		}
	});
	vscode.commands.registerCommand('extension.openJsonSelection', range => jsonOutlineProvider.select(range));

new TestView(context);

new TestViewDragAndDrop(context);

  const symbolListProvider = new SymbolListProvider();
  const symbolListDragAndDrop = new SymbolListDragAndDrop(symbolListProvider);
  // Register the symbol list tree view
    const symbolListView = vscode.window.createTreeView('symbolList', {
        treeDataProvider: symbolListProvider,
        dragAndDropController: symbolListDragAndDrop,
        showCollapseAll: true
    });
    context.subscriptions.push(symbolListView);

    // Command to toggle symbol in the list
    vscode.commands.registerCommand('extension.toggleSymbol', (symbol: vscode.SymbolInformation) => {
        symbolListProvider.toggleSymbol(symbol);
        vscode.window.showInformationMessage(`Symbol ${symbol.name} added to list!`);
    });
    // vscode.commands.registerCommand('extension.createDocs', () => {
    //     console.log('Creating documentation...');
    //     symbolListProvider.symbolList.forEach(symbol => {
    //         console.log(`Documenting symbol: ${symbol.name}`);
    //     });
    // });

}



// Test out the nodeDependecies Provider:

//  // Subscribe to the onDidChangeTreeData event
//   nodeDependenciesProvider.onDidChangeTreeData(() => {
//     // Refresh the tree view to show the changes
//     vscode.window.createTreeView("nodeDependencies", {
//       treeDataProvider: nodeDependenciesProvider,
//     });
//   });
//   vscode.window.registerTreeDataProvider(
//     "nodeDependencies",
//     nodeDependenciesProvider
//   );
//   vscode.window.createTreeView("nodeDependencies", {
//     treeDataProvider: nodeDependenciesProvider,
//   });


// const jsonOutlineProvider = new JsonOutlineProvider(context);
//   jsonOutlineProvider.onDidChangeTreeData(() => {
//     // Refresh the tree view to show the changes
//     vscode.window.createTreeView("jsonOutline", {
//       treeDataProvider: jsonOutlineProvider,
//     });
//   });
//   vscode.window.registerTreeDataProvider(
//     "jsonOutline",
//     nodeDependenciesProvider
//   );
//   vscode.window.createTreeView("jsonOutline", {
//     treeDataProvider: nodeDependenciesProvider,
//   });

  // const TestViewDragAndDropProvider = new TestViewDragAndDrop(context);
  // TestViewDragAndDropProvider.onDidChangeTreeData(() => {
  //   // Refresh the tree view to show the changes
  //   vscode.window.createTreeView("testViewDragAndDrop", {
  //     treeDataProvider: TestViewDragAndDropProvider,
  //   });
  // });
  // vscode.window.registerTreeDataProvider(
  //   "testViewDragAndDrop",
  //   nodeDependenciesProvider
  // );
  // vscode.window.createTreeView("testViewDragAndDrop", {
  //   treeDataProvider: TestViewDragAndDropProvider,
  // });
