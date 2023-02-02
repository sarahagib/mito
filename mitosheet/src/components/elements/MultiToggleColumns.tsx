// Copyright (c) Mito
import React from 'react';
import { ColumnHeader, ColumnID, SheetData } from '../../types';
import { toggleInArray } from '../../utils/arrays';
import { getDisplayColumnHeader } from '../../utils/columnHeaders';
import { getDtypeValue } from '../taskpanes/ControlPanel/FilterAndSortTab/DtypeCard';
import MultiToggleBox from './MultiToggleBox';
import MultiToggleItem from './MultiToggleItem';
import { Height } from './sizes.d';

interface MultiToggleColumnsProps {
    sheetData: SheetData | undefined;
    selectedColumnIDs: ColumnID[],
    onChange: (newSelectedColumnIDs: ColumnID[]) => void;
    height?: Height;
    disabledColumnIDs?: ColumnID[],
    getIsDisabledColumnID?: (columnID: ColumnID, columnHeader: ColumnHeader, columnDtype: string) => boolean;
    getDisplayColumnHeaderOverride?: (columnID: ColumnID, columnHeader: ColumnHeader) => string;
}

/**
 * The MultiToggleDataframe component allows the user to toggle and select multiple
 * different columns at once
 */
const MultiToggleColumns = (props: MultiToggleColumnsProps): JSX.Element => {

    const columnIDsMap = props.sheetData?.columnIDsMap || {};
    const columnIDsAndDtype: [ColumnID, string][] = Object.entries(props.sheetData?.columnDtypeMap || {});
    const columnIDs: ColumnID[] = columnIDsAndDtype.map(([cid, ]) => {return cid});

    return (
        <MultiToggleBox
            searchable
            onToggleAll={(newSelectedIndexes) => {
                const newSelectedColumnIDs = newSelectedIndexes.map(index => {return columnIDs[index]});
                props.onChange(newSelectedColumnIDs);
            }}
            height='medium'
        >
            {columnIDsAndDtype.map(([columnID, columnDtype], index) => {
                const columnHeader = columnIDsMap[columnID];

                // We turn off and disable the toggle in the case it is included in the id variables, 
                // as pandas automatically filters the id variables out from the value variables
                const toggle = props.selectedColumnIDs.includes(columnID);
                const disabled = (props.disabledColumnIDs !== undefined && props.disabledColumnIDs.includes(columnID)) 
                    || (props.getIsDisabledColumnID !== undefined && props.getIsDisabledColumnID(columnID, columnHeader, columnDtype));

                const displayColumnHeader = props.getDisplayColumnHeaderOverride !== undefined 
                    ? props.getDisplayColumnHeaderOverride(columnID, columnHeader)
                    : getDisplayColumnHeader(columnHeader);

                return (
                    <MultiToggleItem
                        key={index}
                        index={index}
                        title={displayColumnHeader}
                        rightText={getDtypeValue(columnDtype)}
                        toggled={toggle}
                        onToggle={() => {
                            const newSelectedColumnIds = [...props.selectedColumnIDs];
                            toggleInArray(newSelectedColumnIds, columnID);
                            props.onChange(newSelectedColumnIds);
                        }}
                        disabled={disabled}
                    />
                ) 
            })}
        </MultiToggleBox>
    )
}

export default MultiToggleColumns;