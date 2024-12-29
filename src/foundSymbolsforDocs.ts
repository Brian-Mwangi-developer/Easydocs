import * as vscode from 'vscode';

export class SymbolListProvider implements vscode.TreeDataProvider<vscode.SymbolInformation> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.SymbolInformation[] | undefined> = new vscode.EventEmitter<vscode.SymbolInformation[] | undefined>();
    public onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;
    
    private symbolList: vscode.SymbolInformation[] = [];

    constructor() {
        // Listen for editor changes and document changes
        vscode.window.onDidChangeActiveTextEditor(() => this.refreshSymbols());
        vscode.workspace.onDidChangeTextDocument(() => this.refreshSymbols());
    }

    // Refresh the symbol list whenever the document or editor changes
    private refreshSymbols(): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {return;}

        // Get all symbols in the current document
        vscode.commands.executeCommand<vscode.SymbolInformation[]>('vscode.executeDocumentSymbolProvider', editor.document.uri)
            .then(symbols => {
                this.symbolList = symbols || [];
                this._onDidChangeTreeData.fire(this.symbolList);
            });
    }

    // Fetch children for a symbol (if needed, you can modify this to show nested symbols)
    getChildren(element?: vscode.SymbolInformation): Thenable<vscode.SymbolInformation[]> {
        return Promise.resolve(this.symbolList);
    }

    // Define how the symbols are represented in the TreeView
    getTreeItem(element: vscode.SymbolInformation): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(element.name, vscode.TreeItemCollapsibleState.None);
        treeItem.command = {
            command: 'vscode.open',
            title: '',
            arguments: [element.location.uri]
        };
        return treeItem;
    }

    // Add symbol to list for documentation (or remove it)
    public toggleSymbol(symbol: vscode.SymbolInformation): void {
        const index = this.symbolList.findIndex(s => s.name === symbol.name);
        if (index >= 0) {
            // Remove from list
            this.symbolList.splice(index, 1);
        } else {
            // Add to list
            this.symbolList.push(symbol);
        }
        this._onDidChangeTreeData.fire(this.symbolList);
    }
}


export class SymbolListDragAndDrop implements vscode.TreeDragAndDropController<vscode.SymbolInformation> {
    dropMimeTypes = ['application/vnd.code.tree.symbols'];
    dragMimeTypes = ['text/uri-list'];

    private symbolListProvider: SymbolListProvider;

    constructor(symbolListProvider: SymbolListProvider) {
        this.symbolListProvider = symbolListProvider;
    }

    public async handleDrop(target: vscode.SymbolInformation | undefined, sources: vscode.DataTransfer, _token: vscode.CancellationToken): Promise<void> {
        const transferItem = sources.get('application/vnd.code.tree.symbols');
        if (!transferItem) {
            return;
        }
        const symbols: vscode.SymbolInformation[] = transferItem.value;
        // Handle the logic for reordering the symbols in the list
        // This would typically involve removing the symbols from their old location and adding them to the new one
    }

    public async handleDrag(source: vscode.SymbolInformation[], treeDataTransfer: vscode.DataTransfer, _token: vscode.CancellationToken): Promise<void> {
        treeDataTransfer.set('application/vnd.code.tree.symbols', new vscode.DataTransferItem(source));
    }
}
