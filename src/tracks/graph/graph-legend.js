import { select } from 'd3';
import {
  renderLinePlotLegend,
  renderAreaPlotLegend,
  renderDifferentialPlotLegend,
  renderDotPlotLegend,
} from '../../plots/legend/index';
import LegendHelper from '../../utils/legend-helper';
import { LinePlot, AreaPlot, DotPlot, DifferentialPlot } from '../../plots';

/**
 * Function for calculating the number of legend rows required by the track
 * @param {GraphTrack} track track instance
 * @returns {number} number of legend rows required, based on current assigned plot instances
 */
function getGraphTrackLegendRows(track) {
  return track.plots.reduce((rows, p) => rows + p.options.legendRows || 0, 0);
}

/**
 * Updates the selection of legend rows of a graph track
 * @param {d3.Selection} selection selection to update
 * @param {{top:number,left:number,width:number,heigh:number}} bounds bounding box
 * @param {number} width clientWidth of container element
 * @param {GraphTrack} track track instance
 */
function updateLegendRows(selection, bounds, width, track) {
  let posY = bounds.top;

  const legendRows = getGraphTrackLegendRows(track);
  const legendRowHeight = bounds.height / legendRows;

  selection.each(function updateLegendRow(plot) {
    const g = select(this);
    const left = plot.offset * width;

    const rowBounds = {
      top: 0,
      left,
      width: width - left,
      height: (plot.options.legendRows || 0) * legendRowHeight,
    };

    g.attr('transform', `translate(0,${posY})`);

    posY += rowBounds.height;

    const legendInfo = track.data && plot.options.legendInfo ?
      plot.options.legendInfo(track.data) :
      {};

    if (plot instanceof LinePlot) {
      renderLinePlotLegend(g, rowBounds, legendInfo, plot);
    } else if (plot instanceof AreaPlot) {
      renderAreaPlotLegend(g, rowBounds, legendInfo, plot);
    } else if (plot instanceof DotPlot) {
      renderDotPlotLegend(g, rowBounds, legendInfo, plot);
    } else if (plot instanceof DifferentialPlot) {
      renderDifferentialPlotLegend(g, rowBounds, legendInfo, plot);
    }
  });
}

/**
 * Updates the legend section of a graph track
 * @param {HTMLElement} elm legend container
 * @param {{top:number,left:number,width:number,heigh:number}} bounds bounding box
 * @param {GraphTrack} track track instance
 */
function onUpdateLegend(elm, bounds, track) {
  const lg = select(elm);

  const w = lg.node().clientWidth;

  const g = lg.select('.svg-legend');
  const rows = g.selectAll('.legend-row').data(track.plots);
  rows.enter().append('g').classed('legend-row', true);
  rows.exit().remove();

  g.selectAll('.legend-row').call(updateLegendRows, bounds, w, track);
}

/**
 * A legend config object that can be added to a graph track config
 */
export default LegendHelper.basicLegendSvgConfig(getGraphTrackLegendRows, onUpdateLegend);
