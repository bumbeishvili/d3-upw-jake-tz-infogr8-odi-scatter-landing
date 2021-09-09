class Chart {
    constructor() {
        const attrs = {
            id: "ID" + Math.floor(Math.random() * 1000000),
            svgWidth: 400,
            svgHeight: 400,
            marginTop: 65,
            marginBottom: 65,
            marginRight: 25,
            marginLeft: 45,
            container: "body",
            defaultTextFill: "#2C3E50",
            title: 'Evaluation against success indicator',
            xAxisTitle: 'Stage of implementation',
            data: null
        };
        this.getState = () => attrs;
        this.setState = (d) => Object.assign(attrs, d);
        Object.keys(attrs).forEach((key) => {
            //@ts-ignore
            this[key] = function (_) {
                var string = `attrs['${key}'] = _`;
                if (!arguments.length) {
                    return eval(`attrs['${key}'];`);
                }
                eval(string);
                return this;
            };
        });
        this.initializeEnterExitUpdatePattern();
    }

    initializeEnterExitUpdatePattern() {
        d3.selection.prototype.patternify = function (params) {
            var container = this;
            var selector = params.selector;
            var elementTag = params.tag;
            var data = params.data || [selector];
            // Pattern in action
            var selection = container.selectAll("." + selector).data(data, (d, i) => {
                if (typeof d === "object") {
                    if (d.id) {
                        return d.id;
                    }
                }
                return i;
            });
            selection.exit().remove();
            selection = selection.enter().append(elementTag).merge(selection);
            selection.attr("class", selector);
            return selection;
        };
    }

    // ================== RENDERING  ===================
    render() {
        this.setDynamicContainer();
        this.calculateProperties();
        this.drawSvgAndWrappers();
        this.drawAxes();
    }

    drawAxes() {
        const {
            chart,
            xAxisTitle,
            title,
            calc: { chartWidth, chartHeight }
        } = this.getState();

        const xScale = d3.scaleLinear().domain([0, 100]).range([0, chartWidth]);

        const yScale = d3.scaleLinear().domain([100, 0]).range([0, chartHeight]);

        const xAxis = d3.axisBottom(xScale).tickSize(-chartHeight).tickFormat(d => d ? (d + '%') : d);
        const yAxis = d3.axisLeft(yScale).tickSize(-chartWidth).tickFormat(d => d ? (d + '%') : d);

        const axisWrapper = chart.patternify({ tag: 'g', selector: 'axis-wrapper' })
        const xAxisWrapper = axisWrapper
            .patternify({
                tag: "g",
                selector: "x-axis-wrapper"
            })
            .attr('transform', `translate(${0},${chartHeight})`)

        const yAxisWrapper = axisWrapper.patternify({
            tag: "g",
            selector: "y-axis-wrapper"
        })
        xAxisWrapper.call(xAxis);
        yAxisWrapper.call(yAxis);

        axisWrapper.selectAll('.tick line')
            .attr('stroke', 'rgba(255, 255, 255, 0.3)')
            .attr('stroke-dasharray', '1 1')
        axisWrapper.selectAll('.domain').remove()
        axisWrapper.selectAll('text')
            .attr('fill', 'white')

        xAxisWrapper.selectAll('text').attr('y', 10)
        yAxisWrapper.selectAll('text').attr('x', -10)

        const overlayRects = [
            { anchor: 'start', textY: 20 + 5, textX: 20, name: "Limited energy", x: 0, y: 0, width: chartWidth / 2, height: chartHeight / 2, fill: 'rgba(255, 255, 255, 0.2)' },
            { anchor: 'end', textY: 20 + 5, textX: chartWidth - 20, name: "Leaders", x: chartWidth / 2, y: 0, width: chartWidth / 2, height: chartHeight / 2, fill: 'rgba(255, 255, 255, 0.3)' },
            { anchor: 'end', textY: chartHeight - 20, textX: chartWidth - 20, name: "Less prepared", x: chartWidth / 2, y: chartHeight / 2, width: chartWidth / 2, height: chartHeight / 2, fill: 'rgba(255, 255, 255, 0.2)' },
            { anchor: 'start', textY: chartHeight - 20, textX: 20, name: "Limited vision", x: 0, y: chartHeight / 2, width: chartWidth / 2, height: chartHeight / 2, fill: 'rgba(255, 255, 255, 0.1)' },
        ]

        axisWrapper.patternify({ tag: 'rect', selector: 'rect-item', data: overlayRects })
            .attr('width', d => d.width)
            .attr('height', d => d.height)
            .attr('fill', d => d.fill)
            .attr('x', d => d.x)
            .attr('y', d => d.y)

        axisWrapper.patternify({ tag: 'text', selector: 'text-rect-item', data: overlayRects })
            .text(d => d.name)
            .attr('fill', 'rgba(255, 255, 255, 1)')
            .attr('font-weight', 'bold')
            .attr('x', d => d.textX)
            .attr('y', d => d.textY)
            .attr('text-anchor', d => d.anchor)

        chart.patternify({ tag: 'text', selector: 'title' })
            .text(title)
            .attr('fill', 'rgba(255, 255, 255, 1)')
            .attr('y', -20)

        chart.patternify({ tag: 'text', selector: 'x-axis-title' })
            .text(xAxisTitle)
            .attr('text-anchor', 'middle')
            .attr('fill', 'rgba(255, 255, 255, 1)')
            .attr('y', chartHeight + 50)
            .attr('x', chartWidth / 2)

    }

    setDynamicContainer() {
        const attrs = this.getState();

        //Drawing containers
        var container = d3.select(attrs.container);
        var containerRect = container.node().getBoundingClientRect();
        if (containerRect.width > 0) attrs.svgWidth = containerRect.width;
        this.setState({ container });
    }

    drawSvgAndWrappers() {
        const {
            container,
            svgWidth,
            svgHeight,
            calc
        } = this.getState();

        // Draw SVG
        const svg = container
            .patternify({
                tag: "svg",
                selector: "svg-chart-container"
            })
            .attr("width", svgWidth)
            .attr("height", svgHeight)

        //Add container g element
        var chart = svg
            .patternify({
                tag: "g",
                selector: "chart"
            })
            .attr(
                "transform",
                "translate(" + calc.chartLeftMargin + "," + calc.chartTopMargin + ")"
            );

        this.setState({ chart, svg })
    }

    calculateProperties() {
        const attrs = this.getState();

        //Calculated properties
        var calc = {
            id: null,
            chartTopMargin: null,
            chartLeftMargin: null,
            chartWidth: null,
            chartHeight: null
        };
        calc.id = "ID" + Math.floor(Math.random() * 1000000); // id for event handlings
        calc.chartLeftMargin = attrs.marginLeft;
        calc.chartTopMargin = attrs.marginTop;
        calc.chartWidth = attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
        calc.chartHeight =
            attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;

        this.setState({ calc });
    }

    updateData(data) {
        const attrs = this.getChartState();
        console.log("smoothly updating data");
        return this;
    }
}