import {
  scaleLinear,
  zoom,
  zoomTransform,
  select,
  event as d3event,
} from 'd3';

export default class BasicTrackViewer {
  constructor(tracks, domain = [0, 1000]) {
    this.tracks = tracks;
    this.zoom = null;
    this.width = 0;
    this.height = 0;
    this.domain = domain;
    this.scale = scaleLinear().domain(domain);

    this.zoomed = this.zoomed.bind(this);
  }

  // hook up to DOM element and add child elements and event handlers
  init(elm) {
    this.width = elm.clientWidth;
    this.height = elm.clientHeight;

    const root = select(elm);

    root.styles({
      'user-select': 'none',
      flex: '1 1 auto',
      'font-family': 'Verdana, Tahoma, sans-serif',
      display: 'flex',
    }).selectAll('*').remove();

    this.container = root
      .append('div')
      .attr('class', 'tracks-group')
      .styles({
        position: 'relative',
        'min-height': 0,
        display: 'flex',
        flex: '1 1 auto',
        'background-color': 'white',
      });

    this.zoom = zoom()
      .scaleExtent([1, 256])
      .on('zoom', this.zoomed);

    this.container.call(this.zoom);

    this.currentTransform = () => zoomTransform(this.container.node());

    this.update();
  }

  // update child elements and scale - execute callbacks on addded tracks
  update() {
    const {
      container,
      scale,
      height,
      domain,
      tracks,
    } = this;

    scale.domain(domain).range([0, height]);

    const selection = container.selectAll('.track').data(tracks, d => d.id);

    selection.enter().append('div')
      .attr('class', 'track')
      .styles(d => ({
        flex: `${d.options.width}`,
        'max-width': (d.options.maxWidth ? `${d.options.maxWidth}px` : null),
        'border-right': '1.3px solid #333',
        overflow: 'hidden',
        padding: 0,
        'pointer-events': 'none',
        display: 'flex',
        'flex-direction': 'column',
      }))
      .each(function addTrackCallback(d) {
        const ev = {
          elm: this,
          scale,
        };
        d.onMount(ev);
      });


    selection.exit().remove();

    this.tracks.forEach(t => t.onUpdate({
      scale,
    }));
  }

  // handle zoom/pan events
  zoomed() {
    const { transform } = d3event;

    const transScale = this.scale.copy().domain(this.domain);
    this.scale = transform.rescaleY(transScale);

    this.zoom.translateExtent([
      [0, 0],
      [0, this.height],
    ]);

    this.rescale();
  }

  // notify tracks about changed scale/transform so tracks may react to user interaction
  rescale() {
    this.tracks.forEach(track => {
      window.requestAnimationFrame(() => track.onRescale({
        scale: this.scale,
        transform: this.currentTransform(),
      }));
    });
  }
}
