import { renderBasicPlotLegend } from './common';

export default function renderAreaPlotLegend(g, bounds, legendInfo, plot) {
  const { top, left, width, height } = bounds;
  const shadeH = height / 2;
  const shadeY = top;
  const [min, max] = plot.scale.domain();
  const minIsLeft = min <= max;
  const fillOpacity = Math.min(plot.fillOpacity + 0.25, 1);
  const centerX = left + width / 2;

  g.selectAll('*').remove();

  if (plot.options.inverseColor) {
    const shadeW = Math.max(0, width - 2);

    const fillNrm = plot.useMinAsBase && minIsLeft ?
      plot.options.color : plot.options.inverseColor;

    const fillInv = plot.useMinAsBase && minIsLeft ?
      plot.options.inverseColor : plot.options.color;

    g.append('rect').attrs({
      x: left + 2,
      y: shadeY,
      width: shadeW,
      height: shadeH,
      fill: fillNrm,
      'fill-opacity': fillOpacity,
    });

    g.append('rect').attrs({
      x: centerX,
      y: shadeY,
      width: shadeW,
      height: shadeH,
      fill: fillInv,
      'fill-opacity': fillOpacity,
    });
  } else {
    g.append('rect').attrs({
      x: left + 2,
      y: shadeY,
      width: Math.max(0, width - 4),
      height: shadeH,
      fill: plot.color,
      'fill-opacity': fillOpacity,
    });
  }

  renderBasicPlotLegend(
    g,
    bounds,
    legendInfo.label,
    legendInfo.unit,
    plot.scale.domain(),
    plot.color,
    true,
  );
}
