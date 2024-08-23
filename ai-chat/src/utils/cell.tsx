
import { INotebookTracker } from '@jupyterlab/notebook';
import { Cell } from '@jupyterlab/cells';

export const getActiveCell = (notebookTracker: INotebookTracker): Cell | undefined => {

    const notebook = notebookTracker.currentWidget?.content;
    const activeCell = notebook?.activeCell;
    return activeCell || undefined
}

export const getActiveCellCode = (notebookTracker: INotebookTracker): string | undefined => {
    const activeCell = getActiveCell(notebookTracker)
    return activeCell?.model.sharedModel.source
}

export const writeCodeToActiveCell = (notebookTracker: INotebookTracker, code: string): void =>  {
    const activeCell = getActiveCell(notebookTracker)
    if (activeCell?.model.sharedModel.source) {
        activeCell.model.sharedModel.source = code 
    }
}