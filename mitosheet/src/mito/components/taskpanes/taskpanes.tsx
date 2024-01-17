// Copyright (c) Mito

import { SendFunctionError } from "../../api/send";
import { BackendPivotParams, ColumnID, GraphSidebarTab, MergeParams } from "../../types";
import { OpenGraphType } from "./Graph/GraphSidebar";
import { MergeType } from "./Merge/MergeTaskpane";
import { FailedReplayData } from "./UpdateImports/UpdateImportsTaskpane";

/* 
    Each Taskpane has a type (included TaskpaneType.NONE, which is the type of _no taskpane_ (e.g. nothing is displayed)).

    If you want to be able to open a taskpane in Mito, then you need to add the type of this taskpane, 
    as well as any __unique__ parameters it has, to this type.

    For example, if you create a new taskpane 'Dork' that takes a selectedSheetIndex as input, then you don't need to 
    add a param to Dork here because the selectedSheetIndex is already stored in the Mito state. But if Dork takes a param
    timeOfOpen, which is not stored in the Mito state already, then you must add timeOfOpen to the params here. 

    It would look like this: 
        | {type: 'TaskpaneType.DORK', timeOfOpen: string}

    By adding any special params to the taskpane type we ensure that any time we create the taskpane, the special param
    is added to the state (this happens through the setCurrOpenTaskpane function. 

    Then, when we are actually setting the taskpane component in getCurrOpenTaskpane, we're able to access the special param using
    this.state.currOpenTaskpane.timeOfOpen
*/
export enum TaskpaneType {
    CONTROL_PANEL = 'control_panel',
    DOWNLOAD = 'download',
    DROP_DUPLICATES = 'drop_duplicates',
    GRAPH = 'graph',
    IMPORT_FILES = 'import files',
    MERGE = 'merge',
    CONCAT = 'concat',
    NONE = 'none',
    PIVOT = 'pivot',    
    STEPS = 'steps',
    SPLIT_TEXT_TO_COLUMNS = 'split_text_to_columns',
    UPGRADE_TO_PRO = 'upgrade_to_pro',
    IMPORT_FIRST = 'import_first', // when you want to tell the user to import first
    FILL_NA = 'fill_na',
    MELT = 'melt',
    SET_DATAFRAME_FORMAT = 'set_dataframe_format',
    CONDITIONALFORMATTING = 'ConditionalFormatting',
    DATAFRAMEIMPORT = 'DataframeImport',
    UPDATEIMPORTS = 'UpdateImports',
    CANNOTCREATECOMM = 'CannotCreateComm',
    CODESNIPPETS = 'CodeSnippets',
    SNOWFLAKEIMPORT = 'SnowflakeImport',
    EXCEL_RANGE_IMPORT = 'Excel Range Import',
    EXPORT_TO_FILE = 'Export To File',
    AITRANSFORMATION = 'AITransformation',
    CODEOPTIONS = 'CodeOptions',
    COLUMN_HEADERS_TRANSFORM = 'Column Headers Transform',
    USERDEFINEDIMPORT = 'UserDefinedImport',
    USER_DEFINED_EDIT = 'User Defined Edit',
    GITHUB_SCHEDULE = 'GithubSchedule',
    // AUTOGENERATED LINE: TASKPANETYPE (DO NOT DELETE)
}

export type TaskpaneInfo = 
    | {type: TaskpaneType.CONTROL_PANEL}
    | {
        type: TaskpaneType.UPGRADE_TO_PRO,
        proOrEnterprise: 'Pro' | 'Enterprise'
    }
    | {type: TaskpaneType.DOWNLOAD}
    | {type: TaskpaneType.DROP_DUPLICATES}
    | {
        type: TaskpaneType.GRAPH,
        graphSidebarTab: GraphSidebarTab,

        openGraph: OpenGraphType
    }    
    | {type: TaskpaneType.IMPORT_FILES}
    | {type: TaskpaneType.MERGE, defaultMergeType?: MergeType, existingParams?: MergeParams}
    | {type: TaskpaneType.CONCAT}
    | {type: TaskpaneType.NONE}
    | {
        type: TaskpaneType.PIVOT,
        sourceSheetIndex: number,
        // Optional params only defined if this is a pivot
        // editing a specific existing pivot table
        destinationSheetIndex?: number;
        existingPivotParams?: BackendPivotParams, 
    } 
    | {type: TaskpaneType.STEPS}
    | {
        type: TaskpaneType.FILL_NA,
        startingColumnIDs?: ColumnID[];
    }
    | {
        type: TaskpaneType.IMPORT_FIRST,
        message: string
    } 
    | {type: TaskpaneType.SPLIT_TEXT_TO_COLUMNS, startingColumnID: ColumnID | undefined}
    | {type: TaskpaneType.MELT}
    | {type: TaskpaneType.SET_DATAFRAME_FORMAT}
    | {
        type: TaskpaneType.CONDITIONALFORMATTING,
        startingColumnIDs?: string[]
    }
    | {type: TaskpaneType.DATAFRAMEIMPORT}
    | {
        type: TaskpaneType.UPDATEIMPORTS,
        failedReplayData?: FailedReplayData
    }
    | {
        type: TaskpaneType.CANNOTCREATECOMM,
        commCreationErrorStatus: SendFunctionError
    }
    | {type: TaskpaneType.CODESNIPPETS}
    | {type: TaskpaneType.SNOWFLAKEIMPORT}
    | {
        type: TaskpaneType.EXCEL_RANGE_IMPORT,
        file_path: string,
        sheet_name: string,
        sheet_names: string[]
    } 
    | {type: TaskpaneType.EXPORT_TO_FILE}
    | {type: TaskpaneType.AITRANSFORMATION}
    | {type: TaskpaneType.CODEOPTIONS}
    | {type: TaskpaneType.COLUMN_HEADERS_TRANSFORM}
    | {
        type: TaskpaneType.USERDEFINEDIMPORT,
        importer_name: string,
    }
    | {
        type: TaskpaneType.USER_DEFINED_EDIT,
        edit_name: string
    }
    | {
        type: TaskpaneType.GITHUB_SCHEDULE,
    }
// AUTOGENERATED LINE: TASKPANEINFO (DO NOT DELETE)

/*
    EDITING_TASKPANES are taskpanes that update the sheet using overwriting 
    and therefore should be closed when the user begins editing the sheet 
    through some other method. 
*/ 
export const EDITING_TASKPANES: TaskpaneType[] = [
    TaskpaneType.PIVOT, 
    TaskpaneType.MERGE, 
    TaskpaneType.CONCAT,
    TaskpaneType.DROP_DUPLICATES,
    TaskpaneType.IMPORT_FILES,
    TaskpaneType.DOWNLOAD,
    TaskpaneType.SPLIT_TEXT_TO_COLUMNS,
    TaskpaneType.FILL_NA,
    TaskpaneType.MELT,
    TaskpaneType.SET_DATAFRAME_FORMAT,
    TaskpaneType.SNOWFLAKEIMPORT,
    TaskpaneType.EXCEL_RANGE_IMPORT,
    TaskpaneType.EXPORT_TO_FILE,
    TaskpaneType.COLUMN_HEADERS_TRANSFORM,
    TaskpaneType.USERDEFINEDIMPORT,
    TaskpaneType.USER_DEFINED_EDIT,
    // AUTOGENERATED LINE: EDITINGTASKPANE (DO NOT DELETE)
]

/**
 * Editing taskpanes where undo / redo should not close them, but rather
 * keep them open (e.g. so they can refresh params)
 * 
 * TODO: remove this, once we make all of the taskpanes work with
 * undo and redo
 */
export const ALLOW_UNDO_REDO_EDITING_TASKPANES = [
    TaskpaneType.PIVOT, 
    TaskpaneType.MERGE,
    TaskpaneType.CONCAT,
    TaskpaneType.DROP_DUPLICATES,
    TaskpaneType.IMPORT_FILES, 
    TaskpaneType.SPLIT_TEXT_TO_COLUMNS,
    TaskpaneType.FILL_NA,
    TaskpaneType.MELT,
    TaskpaneType.SET_DATAFRAME_FORMAT,
    TaskpaneType.CONDITIONALFORMATTING,
    TaskpaneType.UPDATEIMPORTS,
    TaskpaneType.SNOWFLAKEIMPORT,
    TaskpaneType.EXCEL_RANGE_IMPORT,
    TaskpaneType.AITRANSFORMATION,
    TaskpaneType.COLUMN_HEADERS_TRANSFORM,
    TaskpaneType.USERDEFINEDIMPORT,
    TaskpaneType.USER_DEFINED_EDIT,
    // AUTOGENERATED LINE: ALLOWUNDOREDOEDITINGTASKPANE (DO NOT DELETE)
]
    

export const DEFAULT_TASKPANE_WIDTH = 430;
export const TASKPANE_WIDTH_MAX = 500;
export const TASKPANE_WIDTH_MIN = 300;

export const getDefaultTaskpaneWidth = (): number => {
    if (window.innerWidth > 1200) {
        return DEFAULT_TASKPANE_WIDTH;
    }
    
    return TASKPANE_WIDTH_MIN;
}