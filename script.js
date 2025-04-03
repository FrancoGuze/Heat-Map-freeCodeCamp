const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
const container = document.getElementById('container');
const tooltip = document.getElementById('tooltip');

const w = 1450;
const h = 650;
const padLeft = 94;
const padBot = 100;

const svg = d3.select(container)
    .append('svg')
    .attr('width', w)
    .attr('height', h);

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Definir escala de colores
const colorScale = d3.scaleThreshold()
    .domain([-6, -4.5, -3, -1.5, 0, 1.5, 3, 4.5, 6])
    .range([
        "rgb(100,170,240)", "rgb(130,190,245)", "rgb(160,210,250)", 
        "rgb(190,225,255)", "rgb(255,235,215)", "rgb(255,220,190)", 
        "rgb(255,178,102)", "rgb(255,153,51)", "rgb(204,51,0)"
    ]);

fetch(url)
    .then(res => res.json())
    .then(data => {
        const baseTemp = data.baseTemperature;
        const temp = data.monthlyVariance;

        // Escala X (años)
        const scaleX = d3.scaleLinear()
            .domain([d3.min(temp, d => d.year), d3.max(temp, d => d.year)])
            .range([padLeft, w - (padLeft / 3)]);
        const axisX = d3.axisBottom(scaleX).ticks(20).tickFormat(d => d);

        // Escala Y (meses) usando `scaleBand`
        const scaleY = d3.scaleBand()
            .domain(monthNames)  // Usar nombres de meses en el dominio
            .range([padBot / 3, h - padBot])
            .padding(0.05);  // Pequeño espacio entre bandas para evitar solapamientos

        const axisY = d3.axisLeft(scaleY);

        // Crear rectángulos para cada dato
        svg.selectAll('rect')
            .data(temp)
            .enter()
            .append('rect')
            .attr('x', d => scaleX(d.year))
            .attr('y', d => scaleY(monthNames[d.month - 1]))  // Usar nombre del mes
            .attr('width', () => ((w - padLeft / 3) - padLeft) / (temp.length / 12))
            .attr('height', scaleY.bandwidth())  // Ajustar altura correctamente
            .attr('class', 'cell')
            .attr('data-year', d => d.year)
            .attr('data-month', d => d.month - 1)
            .attr('data-temp', d => d.variance)
            .attr('fill', d => colorScale(d.variance))
            .on('mouseover', (event, d) => {
                tooltip.style.display = 'flex';
                tooltip.innerHTML = `<p>${d.year} - ${monthNames[d.month - 1]}</p> 
                                     <p>Temp: ${(baseTemp + d.variance).toFixed(2)}°C</p> 
                                     <p>Var: ${d.variance.toFixed(2)}°C</p>`;
                tooltip.setAttribute('data-year', d.year);
            })
            .on('mousemove', (event, d) => {
                tooltip.style.transform = `translate(${scaleX(d.year)+160}px,${scaleY(monthNames[d.month - 1]) - 80}px)`;
            })
            .on('mouseout', () => {
                tooltip.style.display = 'none';
            });

        // Dibujar ejes
        svg.append('g')
            .attr('id', 'x-axis')
            .attr('transform', `translate(0,${h - padBot})`)
            .call(axisX);

        svg.append('g')
            .attr('id', 'y-axis')
            .attr('transform', `translate(${padLeft - 1},0)`)
            .call(axisY);

        //  Agregar la leyenda
        const legendWidth = 400;
        const legendHeight = 50;
        const legendPadding = 10;

        const legend = svg.append('g')
            .attr('id', 'legend')
            .attr('transform', `translate(${w / 2 - legendWidth / 2}, ${h - padBot / 2})`);

        const legendScale = d3.scaleLinear()
            .domain(d3.extent(colorScale.domain()))
            .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale)
            .tickValues(colorScale.domain())
            

        legend.selectAll('rect')
            .data(colorScale.range().map((color, i) => {
                const d = colorScale.domain();
                return {
                    color: color,
                    x0: i === 0 ? d[0] : d[i - 1],
                    x1: d[i]
                };
            }))
            .enter()
            .append('rect')
            .attr('x', d => legendScale(d.x0))
            .attr('y', 0)
            .attr('width', d => legendScale(d.x1) - legendScale(d.x0))
            .attr('height', legendHeight)
            .attr('fill', d => d.color);

        legend.append('g')
            .attr('transform', `translate(0, ${legendHeight})`)
            .call(legendAxis);

        //  Agregar los valores de temperatura sobre la leyenda
        legend.selectAll("text")
            .data(colorScale.domain())
            .enter()
            .append("text")
            .attr("x", d => legendScale(d) + 5)
            .attr("y", legendHeight - 5)
            .text(d => `${(baseTemp + d).toFixed(1)}°C`)
            .attr("fill", "black")
            .attr("font-size", "12px");
    });



    // ((w - padLeft / 3) - padLeft) / (temp.length / 12)


    