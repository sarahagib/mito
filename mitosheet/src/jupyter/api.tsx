// Copyright (c) Mito

import { SnowflakeCredentialsValidityCheckResult } from "../components/elements/AuthenticateToSnowflakeCard";
import { CSVFileMetadata } from "../components/import/CSVImportConfigScreen";
import { ExcelFileMetadata } from "../components/import/XLSXImportConfigScreen";
import { ModalEnum } from "../components/modals/modals";
import { AICompletionSelection } from "../components/taskpanes/AITransformation/AITransformationTaskpane";
import { ColumnHeadersTransformLowerCaseParams, ColumnHeadersTransformUpperCaseParams } from "../components/taskpanes/ColumnHeadersTransform/ColumnHeadersTransformTaskpane";
import { ControlPanelTab } from "../components/taskpanes/ControlPanel/ControlPanelTaskpane";
import { SortDirection } from "../components/taskpanes/ControlPanel/FilterAndSortTab/SortCard";
import { GraphObject } from "../components/taskpanes/ControlPanel/SummaryStatsTab/ColumnSummaryGraph";
import { UniqueValueCount, UniqueValueSortType } from "../components/taskpanes/ControlPanel/ValuesTab/ValuesTab";
import { FileElement } from "../components/taskpanes/FileImport/FileImportTaskpane";
import { convertFrontendtoBackendGraphParams } from "../components/taskpanes/Graph/graphUtils";
import { AvailableSnowflakeOptionsAndDefaults, SnowflakeCredentials, SnowflakeTableLocationAndWarehouse } from "../components/taskpanes/SnowflakeImport/SnowflakeImportTaskpane";
import { SplitTextToColumnsParams } from "../components/taskpanes/SplitTextToColumns/SplitTextToColumnsTaskpane";
import { StepImportData } from "../components/taskpanes/UpdateImports/UpdateImportsTaskpane";
import { AnalysisData, BackendPivotParams, CodeOptions, CodeSnippetAPIResult, ColumnID, DataframeFormat, FeedbackID, FilterGroupType, FilterType, FormulaLocation, GraphID, GraphParamsFrontend, ParameterizableParams, SheetData, UIState, UserProfile } from "../types";
import { FetchFunction, FetchFunctionErrorReturnType } from "./comm";



export type MitoAPIResult<ResultType> = {result: ResultType} | FetchFunctionErrorReturnType 


export const getRandomId = (): string => {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// NOTE: these have pythonic field names because we parse their JSON directly in the API
export interface SimpleImportSummary {
    step_type: 'simple_import';
    file_names: string[];
}

export interface PathContents {
    path_parts: string[],
    elements: FileElement[];
}

// "stepIndex" -> fileNames list
export type ImportSummaries = Record<string, string[]>;

export enum UserJsonFields {
    UJ_USER_JSON_VERSION = 'user_json_version',
    UJ_STATIC_USER_ID = 'static_user_id',
    UJ_USER_SALT = 'user_salt',
    UJ_USER_EMAIL = 'user_email',
    UJ_RECEIVED_TOURS = 'received_tours',
    UJ_FEEDBACKS = 'feedbacks',
    UJ_FEEDBACKS_V2 = 'feedbacks_v2',
    UJ_MITOSHEET_CURRENT_VERSION = 'mitosheet_current_version',
    UJ_MITOSHEET_LAST_UPGRADED_DATE = 'mitosheet_last_upgraded_date',
    UJ_MITOSHEET_LAST_FIFTY_USAGES = 'mitosheet_last_fifty_usages',
    UJ_MITOSHEET_TELEMETRY = 'mitosheet_telemetry',
    UJ_MITOSHEET_PRO = 'mitosheet_pro',
    UJ_MITOSHEET_ENTERPRISE = 'mitosheet_enterprise',
    UJ_EXPERIMENT = 'experiment',
    UJ_RECEIVED_CHECKLISTS = 'received_checklists',
    UJ_AI_PRIVACY_POLICY = 'ai_privacy_policy',
    UJ_AI_MITO_API_NUM_USAGES = 'ai_mito_api_num_usages',
}

interface MitoSuccessOrInplaceErrorResponse {
    'event': 'response',
    'id': string,
    'shared_variables'?: {
        'sheet_data_json': string,
        'analysis_data_json': string,
        'user_profile_json': string
    }
    'data': unknown
}
interface MitoErrorModalResponse {
    event: 'edit_error'
    id: string,
    type: string;
    header: string;
    to_fix: string;
    traceback?: string;
    data: undefined;
}

export type MitoResponse = MitoSuccessOrInplaceErrorResponse | MitoErrorModalResponse


declare global {
    interface Window { commands: any }
}

/*
    The MitoAPI class contains functions for interacting with the Mito backend. 
    
    All interactions with the backend should go through this call, so that:
    1. If we ever move to a more standard API, the migration is protected by this interface!
    2. We can make sure that every backend call can be met with a response.

    At a high-level, this MitoAPI class works in the following way:
    1. The frontend wants to send a message, for example an `add_column_edit` message.
    2. The `sendColumnAddMessage` is called, and it:
        1. Takes the correct inputs to generate this message
        2. Sends the actual message to the backend, making sure to include an 'id'.
        NOTE: an 'id' identifies a _message_ and is distinct from the 'step_id'.
        3. This function then waits for a response from the backend
    3. The backend receives the message, and processes it:
        1. If it is successful, it sends a response that contains the same 
           'id' as the 'add_column_edit' message it received. 
        2. If it fails, it sends an error message that also includes this 
           'id'. 
    4.  This response includes the data necessary to update the frontend, either
        the sheet_data_array, etc or the error.
    5. The frontend checks periodically if it has gotten any response with the 'id'
       of the message that it sent. If a response with this 'id' has been received,
       then it processes that response by:
        1. Updating the sheet/code on success
        2. Updating the error modal on failure. NOTE: in the future, we can make
           it return the error in-place instead.
        3. Stopping waiting and returning control to the caller.
*/
export default class MitoAPI {    
    _send: FetchFunction | undefined;
    getFetchFunction: () => Promise<FetchFunction | undefined>
    setSheetDataArray: React.Dispatch<React.SetStateAction<SheetData[]>>
    setAnalysisData: React.Dispatch<React.SetStateAction<AnalysisData>>
    setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>
    setUIState: React.Dispatch<React.SetStateAction<UIState>>
    
    constructor(
        getFetchFunction: () => Promise<FetchFunction | undefined>,
        setSheetDataArray: React.Dispatch<React.SetStateAction<SheetData[]>>,
        setAnalysisData: React.Dispatch<React.SetStateAction<AnalysisData>>,
        setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>,
        setUIState: React.Dispatch<React.SetStateAction<UIState>>
    ) {
        this.getFetchFunction = getFetchFunction;
        this.setSheetDataArray = setSheetDataArray;
        this.setAnalysisData = setAnalysisData; 
        this.setUserProfile = setUserProfile;
        this.setUIState = setUIState;
    }


    async send<ResultType>(params: Record<string, unknown>): Promise<MitoAPIResult<ResultType>> {

        // Generate a random id, and add it to the params
        const id = getRandomId();
        params['id'] = id;

        if (this._send === undefined) {
            console.log("GETTING SEND");
            this._send = await this.getFetchFunction();
        } 

        if (this._send === undefined) {
            console.error("Unable to establish comm. Quitting");
            return {error: 'Connection error. Unable to establish comm.', shortError: 'Connection error', showErrorModal: true};
        }

        let loadingUpdated = false;
        const timeout: NodeJS.Timeout = setTimeout(() => {
            // TODO: handle loading!
            this.setUIState((prevUIState) => {
                loadingUpdated = true;
                const newLoadingCalls = [...prevUIState.loading];
                newLoadingCalls.push([params['id'] as string, params['step_id'] as string | undefined, params['type'] as string])
                return {
                    ...prevUIState,
                    loading: newLoadingCalls
                }
            });
        }, 500);

        // We use a centralized send function, and handle all errors here
        const response = await this._send<ResultType>(params);


        // Stop the loading from being updated if it hasn't already run
        clearTimeout(timeout);

        // If loading has been updated, then we remove the loading with this value
        if (loadingUpdated) {
            this.setUIState((prevUIState) => {
                const newLoadingCalls = [...prevUIState.loading];
                const messageIndex = newLoadingCalls.findIndex((value) => {return value[0] === id})
                newLoadingCalls.splice(messageIndex, 1);
                return {
                    ...prevUIState,
                    loading: newLoadingCalls
                }
            });
        }

        // Handle errors
        if ('error' in response) {
            // If this asks us to show the error modal, we do so.
            if (response.showErrorModal) {
                this.setUIState((prevUIState) => {
                    return {
                        ...prevUIState,
                        currOpenModal: {
                            type: ModalEnum.Error,
                            error: response
                        }
                    }
                })
            } 

            return response;
        }

        // Otherwise, we simple update the state variables
        if (response.sheetDataArray) {
            this.setSheetDataArray(response.sheetDataArray);
        } 
        if (response.analysisData) {
            this.setAnalysisData(response.analysisData);
        }
        if (response.userProfile) {
            this.setUserProfile(response.userProfile);
        }

        // And return the result
        return {
            result: response.result
        }
    }

    /*
        Gets the path data for given path parts
    */
    async getPathContents(pathParts: string[]): Promise<MitoAPIResult<PathContents>> {
        // TODO: I actually need to parse this from it's string value
        return await this.send<PathContents>({
            'event': 'api_call',
            'type': 'get_path_contents',
            'params': {
                'path_parts': pathParts
            }
        });
    }

    /*
        Given a list of path parts, this returns a string version of the
        path joined.

        Useful for the frontend to send a path through the simple import 
        step that is a string path.
    */
    async getPathJoined(pathParts: string[]): Promise<MitoAPIResult<string>> {
        return await this.send<string>({
            'event': 'api_call',
            'type': 'get_path_join',
            'params': {
                'path_parts': pathParts
            },
        })
    }


    /*
        Returns a string encoding of the CSV file to download
    */
    async getDataframeAsCSV(sheetIndex: number): Promise<MitoAPIResult<string>> {

        // Note: We increase MAX_RETRIES to 250 although 100 worked locally for a dataset with 10M
        // rows and 4 columns, because the server is slower. 
        // TODO: FIX UP TIMEOUT TO MAKE IT LONGER
        return await this.send<string>({
            'event': 'api_call',
            'type': 'get_dataframe_as_csv',
            'params': {
                'sheet_index': sheetIndex
            },
        })
    }

    /*
        Returns a string encoding of the excel file to download

        See the download taskpane to how to use this string, but it
        must be decoded from base64, and then turned into bytes
        before it can be downloaded
    */
    async getDataframesAsExcel(sheetIndexes: number[]): Promise<MitoAPIResult<string>> {
        return await this.send<string>({
            'event': 'api_call',
            'type': 'get_dataframe_as_excel',
            'params': {
                'sheet_indexes': sheetIndexes
            },
        }); // TODO: increase timeout
    }


    /*
        Returns a string encoding of a PNG that can be displayed that
        is a summary graph of the specific column header at a specific
        sheet index. Optionally can pass a yAxis and yAxisSheetIndex 
        if 
    */
    async getColumnSummaryGraph(
        sheetIndex: number,
        column_id: ColumnID,
        height?: string,
        width?: string,
    ): Promise<MitoAPIResult<GraphObject>> {
        return await this.send<GraphObject>({
            'event': 'api_call',
            'type': 'get_column_summary_graph',
            'params': {
                'sheet_index': sheetIndex,
                'column_id': column_id,
                'height': height,
                'width': width,
                'include_plotlyjs': (window as any).Plotly === undefined,
            },
        })
    }


    /*
        Returns a list of the key, values that is returned by .describing 
        this column
    */
    async getColumnDescribe(sheetIndex: number, columnID: ColumnID): Promise<MitoAPIResult<Record<string, string>>> {
        return await this.send<Record<string, string>>({
            'event': 'api_call',
            'type': 'get_column_describe',
            'params': {
                'sheet_index': sheetIndex,
                'column_id': columnID
            },
        })
    }

    /**
     * A very useful general utility for getting the params
     * of a step with a step id or with specific execution data
     */
    async getParams<ParamType>(stepType: string, stepID: string | undefined, executionDataToMatch: Record<string, string | number>): Promise<MitoAPIResult<ParamType | undefined>> {
        return await this.send<ParamType | undefined>({
            'event': 'api_call',
            'type': 'get_params',
            'params': {
                'step_type': stepType,
                'step_id_to_match': stepID || '',
                'execution_data_to_match': executionDataToMatch
            },
        })
    }

    /*
        Gets the parameters for the pivot table at desination sheet
        index, or nothing if there are no params
    */
    async getPivotParams(destinationSheetIndex: number): Promise<MitoAPIResult<BackendPivotParams | undefined>> {
        return await this.getParams<BackendPivotParams>('pivot', undefined, {
            'destination_sheet_index': destinationSheetIndex
        })
    }

    /*
        Gets metadata about an Excel file
    */
    async getExcelFileMetadata(filePath: string): Promise<MitoAPIResult<ExcelFileMetadata>> {
        return await this.send<ExcelFileMetadata>({
            'event': 'api_call',
            'type': 'get_excel_file_metadata',
            'params': {
                'file_path': filePath
            },
        })
    }

    /*
        Gets metadata about some CSV files
    */
    async getCSVFilesMetadata(fileNames: string[]): Promise<MitoAPIResult<CSVFileMetadata>> {
        return await this.send<CSVFileMetadata>({
            'event': 'api_call',
            'type': 'get_csv_files_metadata',
            'params': {
                'file_names': fileNames
            },
        })
    }


    /*
        Gets the normalized value counts for the series at column_id 
        in the df at sheet_index.
    */
    async getUniqueValueCounts(
        sheetIndex: number,
        columnID: ColumnID,
        searchString: string,
        sort: UniqueValueSortType,
    ): Promise<MitoAPIResult<{ uniqueValueCounts: UniqueValueCount[], isAllData: boolean }>> {

        const resultOrError = await this.send<string>({
            'event': 'api_call',
            'type': 'get_unique_value_counts',
            'params': {
                'sheet_index': sheetIndex,
                'column_id': columnID,
                'search_string': searchString,
                'sort': sort
            },
        })

        if ('error' in resultOrError){
            return resultOrError;
        }

        const uniqueValueCountsString = resultOrError.result;

        const uniqueValueCountsObj: { uniqueValueRowDataArray: (string | number | boolean)[][], isAllData: boolean } = JSON.parse(uniqueValueCountsString);
        const uniqueValueCounts: UniqueValueCount[] = [];
        for (let i = 0; i < uniqueValueCountsObj.uniqueValueRowDataArray.length; i++) {
            uniqueValueCounts.push({
                value: uniqueValueCountsObj.uniqueValueRowDataArray[i][0],
                percentOccurence: (uniqueValueCountsObj.uniqueValueRowDataArray[i][1] as number) * 100,
                countOccurence: (uniqueValueCountsObj.uniqueValueRowDataArray[i][2] as number),
                isNotFiltered: true
            })
        }

        return {result: {
            uniqueValueCounts: uniqueValueCounts,
            isAllData: uniqueValueCountsObj.isAllData
        }}
    }

    /*
        Gets a preview of the split text to columns step
    */
    async getSplitTextToColumnsPreview(params: SplitTextToColumnsParams): Promise<(string | number | boolean)[][] | undefined> {

        await this.send<string>({
            'event': 'api_call',
            'type': 'get_split_text_to_columns_preview',
            'params': params
        })
        // TODO: we need to get the key dfPreviewRowDataArray in the above result
        return undefined;
    }

	
    async getDefinedDfNames(): Promise<MitoAPIResult<string[]>> {
        return await this.send<string[]>({
            'event': 'api_call',
            'type': 'get_defined_df_names',
            'params': {}
        })
    }

    async getImportedFilesAndDataframesFromCurrentSteps(): Promise<MitoAPIResult<StepImportData[]>> {
        return await this.send<StepImportData[]>({
            'event': 'api_call',
            'type': 'get_imported_files_and_dataframes_from_current_steps',
            'params': {}
        })
    }


    async getImportedFilesAndDataframesFromAnalysisName(analysisName: string, args: string[]): Promise<MitoAPIResult<StepImportData[]>> {
        return await this.send<StepImportData[]>({
            'event': 'api_call',
            'type': 'get_imported_files_and_dataframes_from_analysis_name',
            'params': {
                'analysis_name': analysisName,
                'args': args
            }
        })
    }

    
    async getTestImports(updated_step_import_data_list: StepImportData[]): Promise<MitoAPIResult<Record<number, string>>> {

        return await this.send<Record<number, string>>({
            'event': 'api_call',
            'type': 'get_test_imports',
            'params': {
                'updated_step_import_data_list': updated_step_import_data_list,
            }
        })
    }

    
    async getRenderCount(): Promise<MitoAPIResult<number>> {
        return await this.send<number>({
            'event': 'api_call',
            'type': 'get_render_count',
            'params': {}
        })
    }

    
    async getCodeSnippets(): Promise<MitoAPIResult<CodeSnippetAPIResult>> {
        return await this.send<CodeSnippetAPIResult>({
            'event': 'api_call',
            'type': 'get_code_snippets',
            'params': {}
        })
    }

    
    async getAvailableSnowflakeOptionsAndDefaults(table_loc_and_warehouse: SnowflakeTableLocationAndWarehouse): Promise<MitoAPIResult<AvailableSnowflakeOptionsAndDefaults>> {
        return await this.send<AvailableSnowflakeOptionsAndDefaults>({
            'event': 'api_call',
            'type': 'get_available_snowflake_options_and_defaults',
            'params': {
                'table_loc_and_warehouse': table_loc_and_warehouse
            }
        })
    }

    async validateSnowflakeCredentials(params: SnowflakeCredentials): Promise<MitoAPIResult<SnowflakeCredentialsValidityCheckResult>> {
        return await this.send<SnowflakeCredentialsValidityCheckResult>({
            'event': 'api_call',
            'type': 'get_validate_snowflake_credentials',
            'params': params
        })
    }

    
    async getAICompletion(
        user_input: string, 
        selection: AICompletionSelection | undefined,
        previous_failed_completions: [string, string][]
    ): Promise<
        {error: string} | 
        {
            user_input: string,
            prompt_version: string,
            prompt: string,
            completion: string
        } | undefined
        > {

        await this.send<string>({
            'event': 'api_call',
            'type': 'get_ai_completion',
            'params': {
                'user_input': user_input,
                'selection': selection,
                'previous_failed_completions': previous_failed_completions
            }
        })

        return {
            'error': 'how to handle this one'
        }
    }

    
    async getParameterizableParams(): Promise<MitoAPIResult<ParameterizableParams | undefined>> {
        return await this.send<ParameterizableParams | undefined>({
            'event': 'api_call',
            'type': 'get_parameterizable_params',
            'params': {}
        })
    }

    // AUTOGENERATED LINE: API GET (DO NOT DELETE)



    /**
     * A general utility function for sending an edit event with some
     * set of params for that edit event.
     * 
     * @param edit_event_type 
     * @param params the parameters of the step to send
     * @param stepID the step id to overwrite (or undefined if not overwriting a step)
     * @returns the stepID that was sent to the backend
     */
    async _edit<ParamType>(
        edit_event_type: string,
        params: ParamType,
        stepID: string
    ): Promise<MitoAPIResult<never>> {
        return await this.send({
            'event': 'edit_event',
            'type': edit_event_type,
            'step_id': stepID,
            'params': params
        });
    }

    async editGraph(
        graphID: GraphID,
        graphParams: GraphParamsFrontend,
        height: string,
        width: string,
        stepID?: string,
    ): Promise<string> {

        // If this is overwriting a graph event, then we do not need to
        // create a new id, as we already have it!
        if (stepID === undefined || stepID === '') {
            stepID = getRandomId();
        }

        const graphParamsBackend = convertFrontendtoBackendGraphParams(graphParams)

        await this.send<string>({
            'event': 'edit_event',
            'type': 'graph_edit',
            'step_id': stepID,
            'params': {
                'graph_id': graphID,
                'graph_preprocessing': graphParamsBackend.graphPreprocessing,
                'graph_creation': graphParamsBackend.graphCreation,
                'graph_styling': graphParamsBackend.graphStyling,
                'graph_rendering': {
                    'height': height, 
                    'width': width
                },
                'include_plotlyjs': (window as any).Plotly === undefined
            }
        })

        return stepID
    }

    async editGraphDelete(
        graphID: GraphID,
    ): Promise<void> {

        await this.send<string>({
            'event': 'edit_event',
            'type': 'graph_delete_edit',
            'step_id': getRandomId(),
            'params': {
                'graph_id': graphID
            }
        })
    }

    async editGraphDuplicate(
        oldGraphID: GraphID,
        newGraphID: GraphID
    ): Promise<void> {
        
        await this.send<string>({
            'event': 'edit_event',
            'type': 'graph_duplicate_edit',
            'step_id': getRandomId(),
            'params': {
                'old_graph_id': oldGraphID,
                'new_graph_id': newGraphID
            }
        })
    }

    async editGraphRename(
        graphID: GraphID,
        newGraphTabName: string
    ): Promise<void> {
        
        await this.send<string>({
            'event': 'edit_event',
            'type': 'graph_rename_edit',
            'step_id': getRandomId(),
            'params': {
                'graph_id': graphID,
                'new_graph_tab_name': newGraphTabName
            }
        })
    }

    /*
        Adds a column with the passed parameters
    */
    async editAddColumn(
        sheetIndex: number,
        columnHeader: string,
        columnHeaderIndex: number,
        stepID?: string
    ): Promise<string> {
        if (stepID === undefined || stepID == '') {
            stepID = getRandomId();
        }
        await this.send({
            'event': 'edit_event',
            'type': 'add_column_edit',
            'step_id': stepID,
            'params': {
                'sheet_index': sheetIndex,
                'column_header': columnHeader,
                'column_header_index': columnHeaderIndex
            }
        })

        return stepID;
    }

    /*
        Adds a delete column message with the passed parameters
    */
    async editDeleteColumn(
        sheetIndex: number,
        columnIDs: ColumnID[],
    ): Promise<void> {
        const stepID = getRandomId();

        // Filter out any undefined values, which would occur if the index column is selected
        columnIDs = columnIDs.filter(columnID => columnID !== undefined)

        await this.send({
            'event': 'edit_event',
            'type': 'delete_column_edit',
            'step_id': stepID,
            'params': {
                'sheet_index': sheetIndex,
                'column_ids': columnIDs
            }
        })
    }

    /*
        Adds a delete column message with the passed parameters
    */
    async editDeleteRow(
        sheetIndex: number,
        labels: (string | number)[],
    ): Promise<void> {

        const stepID = getRandomId();
        await this.send({
            'event': 'edit_event',
            'type': 'delete_row_edit',
            'step_id': stepID,
            'params': {
                'sheet_index': sheetIndex,
                'labels': labels
            }
        })
    }

    
    async editTranspose(
        sheet_index: number,
    ): Promise<void> {

        const stepID = getRandomId();
        await this.send({
            'event': 'edit_event',
            'type': 'transpose_edit',
            'step_id': stepID,
            'params': {
                sheet_index: sheet_index,
            }
        })
    }
    
    
    async editOneHotEncoding(
        sheet_index: number,
        column_id: ColumnID,
    ): Promise<void> {

        const stepID = getRandomId();
        await this.send({
            'event': 'edit_event',
            'type': 'one_hot_encoding_edit',
            'step_id': stepID,
            'params': {
                sheet_index: sheet_index,
                column_id: column_id,
            }
        })
    }
    
    
    async editResetIndex(
        sheet_index: number,
        drop: boolean,
    ): Promise<void> {

        const stepID = getRandomId();
        await this.send({
            'event': 'edit_event',
            'type': 'reset_index_edit',
            'step_id': stepID,
            'params': {
                sheet_index: sheet_index,
                drop: drop,
            }
        })
    }
    
    
    async editAiTransformation(
        user_input: string,
        prompt_version: string,
        prompt: string,
        completion: string,
        edited_completion: string,
    ): Promise<void> {

        const stepID = getRandomId();
        await this.send({
            'event': 'edit_event',
            'type': 'ai_transformation_edit',
            'step_id': stepID,
            'params': {
                user_input: user_input,
                prompt_version: prompt_version,
                prompt: prompt,
                completion: completion,
                edited_completion: edited_completion,
            }
        })
    }
    
    // AUTOGENERATED LINE: API EDIT (DO NOT DELETE)
    
    

    /*
        Adds a delete column message with the passed parameters
    */
    async editPromoteRowToHeader(
        sheetIndex: number,
        index: string | number,
    ): Promise<void> {
        const stepID = getRandomId();

        await this.send({
            'event': 'edit_event',
            'type': 'promote_row_to_header_edit',
            'step_id': stepID,
            'params': {
                'sheet_index': sheetIndex,
                'index': index
            }
        })
    }

    /*
        Reorders the columnID on sheetIndex to the newIndex, and shifts the remaining
        columns to the right.
    */
    async editReorderColumn(
        sheetIndex: number,
        columnID: ColumnID,
        newIndex: number
    ): Promise<void> {
        const stepID = getRandomId();

        await this.send({
            'event': 'edit_event',
            'type': 'reorder_column_edit',
            'step_id': stepID,
            'params': {
                'sheet_index': sheetIndex,
                'column_id': columnID,
                'new_column_index': newIndex
            }
        });
    }

    /*
        Renames the dataframe at sheetIndex.
    */
    async editDataframeRename(
        sheetIndex: number,
        newDataframeName: string,
        stepID?: string,
    ): Promise<string> {

        if (stepID === undefined || stepID === '') {
            stepID = getRandomId();
        }

        await this.send({
            'event': 'edit_event',
            'type': 'dataframe_rename_edit',
            'step_id': stepID,
            'params': {
                'sheet_index': sheetIndex,
                'new_dataframe_name': newDataframeName
            }
        })

        return stepID;
    }

    /*
        Does a filter with the passed parameters, returning the ID of the edit
        event that was generated (in case you want to overwrite it).
    */
    async editFilter(
        sheetIndex: number,
        columnID: ColumnID,
        filters: (FilterType | FilterGroupType)[],
        operator: 'And' | 'Or',
        filterLocation: ControlPanelTab,
        stepID?: string,
    ): Promise<string> {
        // Create a new id, if we need it!
        if (stepID === undefined || stepID === '') {
            stepID = getRandomId();
        }

        await this.send({
            event: 'edit_event',
            type: 'filter_column_edit',
            'step_id': stepID,
            'params': {
                sheet_index: sheetIndex,
                column_id: columnID,
                operator: operator,
                filters: filters,
                filter_location: filterLocation
            }
        });
        return stepID;
    }

    /*
        Does a sort with the passed parameters, returning the ID of the edit
        event that was generated (in case you want to overwrite it).
    */
    async editSort(
        sheetIndex: number,
        columnID: ColumnID,
        sortDirection: SortDirection,
        stepID?: string
    ): Promise<string> {
        if (stepID === undefined || stepID === '') {
            stepID = getRandomId();
        }

        await this.send({
            event: 'edit_event',
            type: 'sort_edit',
            'step_id': stepID,
            'params': {
                sheet_index: sheetIndex,
                column_id: columnID,
                sort_direction: sortDirection,
            }
        });

        return stepID;
    }

    /*
        Renames a column with the passed parameters
    */
    async editRenameColumn(
        sheetIndex: number,
        columnID: ColumnID,
        newColumnHeader: string,
        level?: number,
        stepID?: string
    ): Promise<string> {
        if (stepID === undefined || stepID === '') {
            stepID = getRandomId();
        }

        await this.send({
            event: 'edit_event',
            type: 'rename_column_edit',
            'step_id': stepID,
            'params': {
                sheet_index: sheetIndex,
                column_id: columnID,
                new_column_header: newColumnHeader,
                level: level
            }
        });

        return stepID;
    }

    async editColumnHeadersTransform(
        params: ColumnHeadersTransformUpperCaseParams | ColumnHeadersTransformLowerCaseParams
    ): Promise<void> {

        await this.send<string>({
            'event': 'edit_event',
            'type': 'column_headers_transform_edit',
            'step_id': getRandomId(),
            'params': params
        })
    }

    /*
        Duplicates the dataframe at sheetIndex.
    */
    async editDataframeDuplicate(
        sheetIndex: number
    ): Promise<void> {
        await this.send({
            'event': 'edit_event',
            'type': 'dataframe_duplicate_edit',
            'step_id': getRandomId(),
            'params': {
                'sheet_index': sheetIndex,
            }
        })
    }

    /*
        Deletes the dataframe at the passed sheetIndex
    */
    async editDataframeDelete(
        sheetIndex: number
    ): Promise<void> {
        await this.send({
            'event': 'edit_event',
            'type': 'dataframe_delete_edit',
            'step_id': getRandomId(),
            'params': {
                'sheet_index': sheetIndex,
            }
        })
    }

    /*
        Sets the formatting of the dataframe.
    */
    async editSetDataframeFormat(
        sheetIndex: number,
        dfFormat: DataframeFormat
    ): Promise<MitoAPIResult<never>> {
        return await this.send({
            'event': 'edit_event',
            'type': 'set_dataframe_format_edit',
            'step_id': getRandomId(),
            'params': {
                'sheet_index': sheetIndex,
                'df_format': dfFormat,
            }
        });
    }

    /*
        Sets the formula for the given columns.
    */
    async editSetColumnFormula(
        sheetIndex: number,
        columnID: ColumnID,
        formula_label: string | number | boolean,
        newFormula: string,
        index_labels_formula_is_applied_to: FormulaLocation,
        cell_editor_location: string
    ): Promise<MitoAPIResult<never>> {
        return await this.send({
            'event': 'edit_event',
            'type': 'set_column_formula_edit',
            'step_id': getRandomId(),
            'params': {
                'sheet_index': sheetIndex,
                'column_id': columnID,
                'formula_label': formula_label,
                'new_formula': newFormula,
                'index_labels_formula_is_applied_to': index_labels_formula_is_applied_to,
                'cell_editor_location': cell_editor_location // Just for logging purposes
            }
        });
    }

    /*
        Sets the value of a specific cell
    */
    async editSetCellValue(
        sheetIndex: number,
        columnID: ColumnID,
        dataframeRowIndex: number | string,
        newValue: string,
        cell_editor_location: string
    ): Promise<MitoAPIResult<never>> {
        return await this.send({
            'event': 'edit_event',
            'type': 'set_cell_value_edit',
            'step_id': getRandomId(),
            'params': {
                'sheet_index': sheetIndex,
                'column_id': columnID,
                'row_index': dataframeRowIndex,
                'new_value': newValue,
                'cell_editor_location': cell_editor_location // Just for logging purposes
            }
        });
    }

    /*
        Change dtype of the column at sheetIndex to the newDtype
    */
    async editChangeColumnDtype(
        sheetIndex: number,
        columnIDs: ColumnID[],
        newDtype: string,
        stepID?: string
    ): Promise<string> {
        if (stepID === undefined || stepID == '') {
            stepID = getRandomId();
        }

        await this.send({
            'event': 'edit_event',
            'type': 'change_column_dtype_edit',
            'step_id': stepID,
            'params': {
                'sheet_index': sheetIndex,
                'column_ids': columnIDs,
                'new_dtype': newDtype
            }
        });

        return stepID;
    }

    /*
        Imports the given CSV file names.
    */
    async editSimpleImport(
        fileNames: string[],
    ): Promise<MitoAPIResult<never>> {

        return await this.send({
            'event': 'edit_event',
            'type': 'simple_import_edit',
            'step_id': getRandomId(),
            'params': {
                'file_names': fileNames,
                // NOTE: we do not include the optional params here
            }
        })
    }

    /*
        Imports the given file names.
    */
    async editExcelImport(
        fileName: string,
        sheetNames: string[],
        hasHeaders: boolean,
        skiprows: number,
        stepID?: string
    ): Promise<string> {

        if (stepID === undefined || stepID == '') {
            stepID = getRandomId();
        }

        await this.send({
            'event': 'edit_event',
            'type': 'excel_import_edit',
            'step_id': stepID,
            'params': {
                'file_name': fileName,
                'sheet_names': sheetNames,
                'has_headers': hasHeaders,
                'skiprows': skiprows,
            }
        }) // Excel imports can take a while, so set a long delay (TODO)

        return stepID;
    }

    /*
        Sends an undo message, which removes the last step that was created. 
    */
    async updateUndo(): Promise<void> {
        await this.send({
            'event': 'update_event',
            'type': 'undo',
            'params': {}
        })
    }


    /*
        Sends an go pro message, which allows the user to 
        get a Mito pro account
    */
    async updateGoPro(): Promise<void> {
        await this.send({
            'event': 'update_event',
            'type': 'go_pro',
            'params': {}
        })
    }

    /*
        Sends an redo message, which removes the last step that was created. 
    */
    async updateRedo(): Promise<void> {
        await this.send({
            'event': 'update_event',
            'type': 'redo',
            'params': {}
        })
    }

    /*
        Sends an clear message, which removes all steps from the analysis
        expect the imports
    */
    async updateClear(): Promise<void> {
        await this.send({
            'event': 'update_event',
            'type': 'clear',
            'params': {}
        })
    }

    async updateRenderCount(): Promise<void> {
        await this.send({
            'event': 'update_event',
            'type': 'render_count_update',
            'params': {
                // Log the number of rendered sheets in the notebook
                'number_rendered_sheets': document.querySelectorAll('.mito-container').length,
                // Log the theme of the notebook
                'jupyterlab_theme': document.body.getAttribute('data-jp-theme-name') || 'undefined'
            }
        })
    }

    /*
        Sends a message to tell Mito to replay an existing analysis onto
        the current analysis.
    */
    async updateReplayAnalysis(
        analysisName: string,
        args: string[],
        stepImportDataListToOverwrite?: StepImportData[],
    ): Promise<MitoAPIResult<never>> {

        return await this.send({
            'event': 'update_event',
            'type': 'replay_analysis_update',
            'params': {
                'analysis_name': analysisName,
                'args': args,
                'step_import_data_list_to_overwrite': stepImportDataListToOverwrite === undefined ? [] : stepImportDataListToOverwrite
            }
        });
    }


    /*
        Sends an update message that updates
        the names of the arguments to the mitosheet.sheet call.

        Only called if there is no analysis to replay.
    */
    async updateArgs(args: string[]): Promise<void> {
        await this.send({
            'event': 'update_event',
            'type': 'args_update',
            'params': {
                'args': args
            }
        })
    }

    
    async updateCodeOptions(codeOptions: CodeOptions): Promise<void> {
        await this.send({
            'event': 'update_event',
            'type': 'code_options_update',
            'params': {
                'code_options': codeOptions
            }
        })
    }


    /*
        Sends the user_email to the backend so the user can sign in
    */
    async updateSignUp(
        userEmail: string
    ): Promise<void> {
        await this.send({
            'event': 'update_event',
            'type': 'set_user_field_update',
            'params': {
                'field': UserJsonFields.UJ_USER_EMAIL,
                'value': userEmail
            }
        });
    }

    /*
        Sends the user_email to the backend so the user can sign in
    */
    async updateExistingImports(
        updatedStepImportDataList: StepImportData[]
    ): Promise<MitoAPIResult<never>> { // TODO: should this be never or undefined
        return await this.send({
            'event': 'update_event',
            'type': 'update_existing_import_update',
            'params': {
                'updated_step_import_data_list': updatedStepImportDataList
            }
        });
    }


    /*
        Manually marks the tool as upgraded, which for now stops
        the upgrade modal from popping up multiple times a day. 

        However, it only makes it as updated 10 days ago, which 
        means that a new upgrade prompt will appear in 11 days
        if the user does not actually go through the upgrade
        process
    */
    async updateManuallyMarkUpgraded(): Promise<void> {
        // Change it so that it is 10 days in the past.
        const tenDaysAgo = (new Date()).getDate() - 10;
        const tenDaysAgoDate = new Date();
        tenDaysAgoDate.setDate(tenDaysAgo);

        await this.send({
            'event': 'update_event',
            'type': 'set_user_field_update',
            'params': {
                'field': UserJsonFields.UJ_MITOSHEET_LAST_UPGRADED_DATE,
                // Taken from https://stackoverflow.com/questions/23593052/format-javascript-date-as-yyyy-mm-dd
                'value': tenDaysAgoDate.toISOString().split('T')[0]
            }
        });
    }

    async updateAcceptAITransformationPrivacyPolicy(): Promise<void> {
        await this.send({
            'event': 'update_event',
            'type': 'set_user_field_update',
            'params': {
                'field': UserJsonFields.UJ_AI_PRIVACY_POLICY,
                'value': true
            }
        });
    }

    /*
        Checks outs a specific step by index
    */
    async updateCheckoutStepByIndex(
        stepIndex: number
    ): Promise<void> {

        await this.send({
            'event': 'update_event',
            'type': 'checkout_step_by_idx_update',
            'params': {
                'step_idx': stepIndex
            }
        });
    }

    /* 
        Tells the backend to mark the user as having gone through the tour in the user.json
    */
    async updateCloseTour(tourNames: string[]): Promise<void> {
        await this.send({
            'event': 'update_event',
            'type': 'append_user_field_update',
            'params': {
                'field': UserJsonFields.UJ_RECEIVED_TOURS,
                'value': tourNames
            }
        })
    }

    async updateFeedback(feedbackID: FeedbackID, numUsages: number, questionsAndAnswers: { question: string, answer: string | number }[]): Promise<void> {

        const message: Record<string, unknown> = {
            'event': 'update_event',
            'type': 'update_feedback_v2_obj_update',
            'params': {
                'feedback_id': feedbackID,
                'num_usages': numUsages,
                'questions_and_answers': questionsAndAnswers
            }
        }

        // Elevate the questions and answers to the highest level so that Mixpanel logs it in a way
        // that we can create a dashboard.
        questionsAndAnswers.forEach(questionAndAnswer => {
            message[questionAndAnswer['question']] = questionAndAnswer['answer']
        })

        await this.send(message)
    }

    /*
        Sends a log event from the frontend to the backend, where it is logged
        by the backend. We log in the backend to keep a linear stream of actions 
        that is making.
    */
    async log(
        logEventType: string,
        params?: Record<string, unknown>
    ): Promise<void> {

        const message: Record<string, unknown> = {};

        const defaultParams = {
            // Get the browser information, so we can make sure Mito works for all Mito users
            'user_agent': window.navigator.userAgent,
        }

        // Copy the params, so we don't accidently modify anything
        if (params !== undefined) {
            message['params'] = Object.assign(defaultParams, params);
        } else {
            message['params'] = defaultParams
        }

        // Save the type of event, as well as what is being logged
        message['event'] = 'log_event';
        message['type'] = logEventType;

        // Don't wait a for a response, since we dont' care
        this.send(message);
    }
}