// Copyright (c) Mito

import React, { Fragment } from 'react';
import { MitoAPI } from '../../api/api';
import { AnalysisData, JupyterUtils, UIState, UserProfile } from '../../types';
import DefaultModal from '../DefaultModal';
import TextButton from '../elements/TextButton';
import { ModalEnum } from './modals';

/*
    This modal displays to the user when:
    1. the analysis that they are replaying does not exist on their computer
    2. the analysis errors during replay for some other reason
*/
const UserEditedCodeModal = (
    props: {
        jupyterUtils?: JupyterUtils;
        setUIState: React.Dispatch<React.SetStateAction<UIState>>;
        mitoAPI: MitoAPI,
        userProfile: UserProfile,
        analysisData: AnalysisData,
        codeWithoutUserEdits: string[],
        codeWithUserEdits: string[]
    }): JSX.Element => {
    return (
        <DefaultModal
            header='Insert New Cell?'
            modalType={ModalEnum.Error}
            wide
            viewComponent={
                <Fragment>
                    <div className='text-align-left text-body-1'>
                        Looks like you edited the code generated by Mito in the cell below. Do you want to overwrite these edits or insert a new cell for the Mito generated code?
                    </div>
                </Fragment>
            }
            buttons={
                <>
                    <TextButton 
                        variant='light'
                        width='hug-contents'
                        onClick={() => {
                            props.jupyterUtils?.writeGeneratedCodeToCell(
                                props.analysisData.analysisName, 
                                props.analysisData.code, 
                                props.userProfile.telemetryEnabled, 
                                props.analysisData.publicInterfaceVersion, 
                                (codeWithoutUserEdits: string[], codeWithUserEdits: string[]) => {
                                    props.setUIState(prevUIState => {
                                        return {
                                            ...prevUIState,
                                            currOpenModal: {
                                                type: ModalEnum.UserEditedCode,
                                                codeWithoutUserEdits: codeWithoutUserEdits,
                                                codeWithUserEdits: codeWithUserEdits
                                            }
                                        }
                                    })
                                },
                                props.codeWithoutUserEdits,
                                true,
                            )
                            void props.mitoAPI.log(
                                'overwrite_user_edited_code', 
                                {
                                    length_of_code_with_user_edits: props.codeWithUserEdits.length,
                                    length_of_code_without_user_edits: props.codeWithoutUserEdits.length
                                }
                            );
                            props.setUIState((prevUIState) => {
                                return {
                                    ...prevUIState,
                                    currOpenModal: {type: ModalEnum.None},
                                }
                            });
                        }}
                    >
                        Overwrite Edits
                    </TextButton>
                    <TextButton
                        variant='dark'
                        width='hug-contents'
                        onClick={() => {
                            props.jupyterUtils?.writeGeneratedCodeToCell(
                                props.analysisData.analysisName, 
                                props.analysisData.code, 
                                props.userProfile.telemetryEnabled, 
                                props.analysisData.publicInterfaceVersion, 
                                (codeWithoutUserEdits: string[], codeWithUserEdits: string[]) => {
                                    props.setUIState(prevUIState => {
                                        return {
                                            ...prevUIState,
                                            currOpenModal: {
                                                type: ModalEnum.UserEditedCode,
                                                codeWithoutUserEdits: codeWithoutUserEdits,
                                                codeWithUserEdits: codeWithUserEdits
                                            }
                                        }
                                    })
                                },
                                props.codeWithoutUserEdits,
                                false,
                            )
                            void props.mitoAPI.log(
                                'insert_new_cell_for_user_edited_code',
                                {
                                    length_of_code_with_user_edits: props.codeWithUserEdits.length,
                                    length_of_code_without_user_edits: props.codeWithoutUserEdits.length
                                }
                            )
                            props.setUIState((prevUIState) => {
                                return {
                                    ...prevUIState,
                                    currOpenModal: {type: ModalEnum.None},
                                }
                            })
                        }}
                    >
                        Insert New Cell
                    </TextButton>
                </> 
            }
        />
    )    
};

export default UserEditedCodeModal;