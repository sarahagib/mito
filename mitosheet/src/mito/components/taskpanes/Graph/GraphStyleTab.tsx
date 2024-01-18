// Copyright (c) Saga Inc.

import React from 'react';
import LabelAndColor from '../../../pro/graph/LabelAndColor';
import { GraphParamsFrontend, RecursivePartial } from '../../../types';
import { updateObjectWithPartialObject } from '../../../utils/objects';
import DropdownItem from '../../elements/DropdownItem';
import Input from '../../elements/Input';
import Select from '../../elements/Select';
import Col from '../../layout/Col';
import Row from '../../layout/Row';

export enum AxisType {
    DEFAULT = 'default',
    LINEAR = 'linear',
    LOG = 'log',
    CATEGORY = 'category',
    DATE = 'date',
}

/* 
    Contains all of the options for styling graphs,
    like setting the title and axis labels
*/
function GraphStyleTab(props: {
    graphParams: GraphParamsFrontend
    setGraphParams: React.Dispatch<React.SetStateAction<GraphParamsFrontend>>;
}): JSX.Element {

    const graphCreationParams = props.graphParams.graphCreation;
    const graphStylingParams = props.graphParams.graphStyling;

    function updateGraphParam(update: RecursivePartial<GraphParamsFrontend>): void {
        props.setGraphParams(prevGraphParams => {
            return updateObjectWithPartialObject(prevGraphParams, update);
        })
    }

    return ( 
        <div className='graph-sidebar-toolbar-content'>   
                <Row justify='space-between' align='center'>
                    <Col>
                        <p>
                            Graph Title
                        </p>
                    </Col>
                    <Input 
                        value={graphStylingParams.title.title || ''}
                        placeholder="Default Graph Title"
                        onChange={(e) => {
                            // We set it to undefined so that the backend knows we're not trying to set a custom axis label 
                            const newTitle =  e.target.value !== '' ? e.target.value : undefined
                            return updateGraphParam({graphStyling: {title: {title: newTitle}}});
                        }}
                    />
                </Row>
                <Row justify='space-between' align='center'>
                    <Col>
                        <p>
                            X Axis Title
                        </p>
                    </Col>
                    <Input 
                        value={graphStylingParams.xaxis.title || ''}
                        placeholder="Default X Axis"
                        onChange={(e) => {
                            // We set it to undefined so that the backend knows we're not trying to set a custom axis label 
                            const newTitle =  e.target.value !== '' ? e.target.value : undefined
                            return updateGraphParam({graphStyling: {xaxis: {title: newTitle}}});

                        }}
                    />
                </Row>
                <Row justify='space-between' align='center'>
                    <Col>
                        <p>
                            Y Axis Title
                        </p>
                    </Col>
                    <Input 
                        value={graphStylingParams.yaxis.title || ''}
                        placeholder="Default Y Axis"
                        onChange={(e) => {
                            const newTitle = e.target.value !== '' ? e.target.value : undefined
                            return updateGraphParam({graphStyling: {yaxis: {title: newTitle}}});

                        }}
                    />
                </Row>
                <Row justify='space-between' align='center'>
                    <Col>
                        <p>
                            X Axis Transform
                        </p>
                    </Col>
                    <Select
                        value={props.graphParams.graphStyling.xaxis.type || 'default'}
                        onChange={(xAxisType: string) => {
                            const newXAxisType = (xAxisType !== AxisType.DEFAULT ? xAxisType : undefined) as AxisType | undefined;
                            return updateGraphParam({graphStyling: {xaxis: {type: newXAxisType}}});

                        }}
                        width='small'
                        dropdownWidth='medium'
                    >
                        <DropdownItem
                            title={AxisType.DEFAULT}
                        />
                        <DropdownItem
                            title={AxisType.LINEAR}
                        />
                        <DropdownItem
                            title={AxisType.LOG}
                        />
                        <DropdownItem
                            title={AxisType.DATE}
                        />
                        <DropdownItem
                            title={AxisType.CATEGORY}
                        />
                    </Select>
                </Row>
                <Row justify='space-between' align='center'>
                    <Col>
                        <p>
                            Y Axis Transform
                        </p>
                    </Col>
                    <Select
                        value={props.graphParams.graphStyling.yaxis.type || 'default'}
                        onChange={(yAxisType: string) => {
                            const newYAxisType = (yAxisType !== AxisType.DEFAULT ? yAxisType : undefined) as AxisType | undefined;
                            return updateGraphParam({graphStyling: {yaxis: {type: newYAxisType}}});

                        }}
                        width='small'
                        dropdownWidth='medium'
                    >
                        <DropdownItem
                            title={AxisType.DEFAULT}
                        />
                        <DropdownItem
                            title={AxisType.LINEAR}
                        />
                        <DropdownItem
                            title={AxisType.LOG}
                        />
                        <DropdownItem
                            title={AxisType.DATE}
                        />
                        <DropdownItem
                            title={AxisType.CATEGORY}
                        />
                    </Select>
                </Row>
                <Row justify='space-between' align='center' title='Title of legend'>
                    <Col>
                        <p>
                            Legend title
                        </p>
                    </Col>
                    <Input 
                        value={graphStylingParams.legend.title?.text ? graphStylingParams.legend.title.text : ''} 
                        width='medium'
                        placeholder='Legend title'
                        onChange={(e) => {
                            const newLegendTitle = e.target.value
                            return updateGraphParam({graphStyling: {legend: {title: {text: newLegendTitle}}}});

                        }}     
                    />
                </Row>
                <Row justify='space-between' align='center' title='The x position of the legend'>
                    <Col>
                        <p>
                            X position (-2 to 3)
                        </p>
                    </Col>
                    <Input 
                        value={graphStylingParams.legend.x ? graphStylingParams.legend.x.toString() : ''} 
                        type='number'
                        width='small'
                        // Set default according the https://plotly.com/python/reference/layout/#layout-legend-x
                        placeholder={graphStylingParams.legend.orientation === 'v' ? '1.02' : '0.00'}
                        onChange={(e) => {
                            const newX = e.target.value === '' ? undefined : e.target.value
                            return updateGraphParam({graphStyling: {legend: {x: newX}}});

                        }}     
                    />
                </Row>
                <Row justify='space-between' align='center' title='The y position of the legend'>
                    <Col>
                        <p>
                            Y position (-2 to 3)
                        </p>
                    </Col>
                    <Input 
                        value={graphStylingParams.legend.y ? graphStylingParams.legend.y.toString() : ''} 
                        type='number'
                        width='small'
                        // Set default according the https://plotly.com/python/reference/layout/#layout-legend-y
                        placeholder={graphStylingParams.legend.orientation === 'v' ? '1.00' : graphStylingParams.xaxis.rangeslider.visible ? '1.10' : "-0.10"}
                        onChange={(e) => {
                            const newY = e.target.value === '' ? undefined : e.target.value;
                            return updateGraphParam({graphStyling: {legend: {y: newY}}});
                        }}     
                    />
                </Row>
                <Row justify='space-between' align='center' title='The width of the vertical grid lines'>
                    <Col>
                        <p>
                            Vertical grid width
                        </p>
                    </Col>
                    <Input 
                        value={graphStylingParams.xaxis.gridwidth ? graphStylingParams.xaxis.gridwidth.toString() : ''} 
                        type='number'
                        width='small'
                        placeholder='1'
                        onChange={(e) => {
                            const newVerticalGridWidth = e.target.value === '' ? undefined : e.target.value;
                            return updateGraphParam({graphStyling: {xaxis: {gridwidth: newVerticalGridWidth}}});
                        }}     
                    />
                </Row>
                <Row justify='space-between' align='center' title='The width of the horizontal grid lines'>
                    <Col>
                        <p>
                            Horizontal grid width
                        </p>
                    </Col>
                    <Input 
                        value={graphStylingParams.yaxis.gridwidth ? graphStylingParams.yaxis.gridwidth.toString() : ''} 
                        type='number'
                        width='small'
                        placeholder='1'
                        onChange={(e) => {
                            const newHorizontalGridWidth = e.target.value === '' ? undefined : e.target.value;
                            return updateGraphParam({graphStyling: {yaxis: {gridwidth: newHorizontalGridWidth}}});
                        }}     
                    />
                </Row>
                <LabelAndColor
                    label='Plot Background Color'
                    color={graphStylingParams.plot_bgcolor}
                    onChange={(newColor) => {
                        return updateGraphParam({graphStyling: {plot_bgcolor: newColor}});
                    }}
                />
                <LabelAndColor
                    label='Paper Background Color'
                    color={graphStylingParams.paper_bgcolor}
                    onChange={(newColor) => {
                        return updateGraphParam({graphStyling: {paper_bgcolor: newColor}});
                    }}
                />
                <LabelAndColor
                    label='Title color'
                    color={graphStylingParams.title.title_font_color}
                    onChange={(newColor) => {
                        return updateGraphParam({graphStyling: {title: {title_font_color: newColor}}});
                    }}
                />
                <LabelAndColor
                    label='X axis title color'
                    color={graphStylingParams.xaxis.title_font_color}
                    onChange={(newColor) => {
                        return updateGraphParam({graphStyling: {xaxis: {title_font_color: newColor}}});
                    }}
                />
                <LabelAndColor
                    label='Y axis title color'
                    color={graphStylingParams.yaxis.title_font_color}
                    onChange={(newColor) => {
                        return updateGraphParam({graphStyling: {yaxis: {title_font_color: newColor}}});
                    }}
                />
                <Row justify='space-between' align='center' title='The number of plots to display per row. Has no effect when facet row is used.'>
                    <Col>
                        <p>
                            Number of cols (int)
                        </p>
                    </Col>
                    <Input 
                        value={graphCreationParams.facet_col_wrap ? graphCreationParams.facet_col_wrap.toString() : ''} 
                        type='number'
                        width='small'
                        placeholder='num cols'
                        onChange={(e) => {
                            const newNumCols = e.target.value === '' ? undefined : e.target.value
                            return updateGraphParam({graphCreation: {facet_col_wrap: newNumCols}});
                        }}     
                    />
                </Row>
                <Row justify='space-between' align='center' title='The spacing between columns of facet plots. Set as a fraction of plotting area.'>
                    <Col>
                        <p>
                            Column spacing (0 to 1)
                        </p>
                    </Col>
                    <Input 
                        value={graphCreationParams.facet_col_spacing ? graphCreationParams.facet_col_spacing.toString() : ''} 
                        type='number'
                        width='small'
                        placeholder='.03'
                        onChange={(e) => {
                            const newColSpacing = e.target.value === '' ? undefined : e.target.value
                            return updateGraphParam({graphCreation: {facet_col_spacing: newColSpacing}});
                        }}     
                    />
                </Row>
                <Row justify='space-between' align='center' title='The spacing between rows of facet plots. Set as a fraction of plotting area.'>
                    <Col>
                        <p>
                            Row spacing (0 to 1)
                        </p>
                    </Col>
                    <Input 
                        value={graphCreationParams.facet_row_spacing ? graphCreationParams.facet_row_spacing.toString() : ''} 
                        type='number'
                        width='small'
                        placeholder='.07'
                        onChange={(e) => {
                            const newRowSpacing = e.target.value === '' ? undefined : e.target.value
                            return updateGraphParam({graphCreation: {facet_row_spacing: newRowSpacing}});
                        }}     
                    />
                </Row>
        </div> 
    )
} 

export default GraphStyleTab;



