document.addEventListener('DOMContentLoaded', function () {
    const mediaSlider = document.getElementById('media-slider');
    const desviacionSlider = document.getElementById('desviacion-slider');
    const nSlider = document.getElementById('n-slider');
    const confianzaSlider = document.getElementById('confianza-slider');

    const mediaValue = document.getElementById('media-value');
    const desviacionValue = document.getElementById('desviacion-value');
    const nValue = document.getElementById('n-value');
    const confianzaValue = document.getElementById('confianza-value');

    const hypothesisResult = document.getElementById('hypothesis-result');

    function updateGraphs() {
        const media = parseFloat(mediaSlider.value);
        const desviacion = parseFloat(desviacionSlider.value);
        const n = parseInt(nSlider.value);
        const confianza = parseInt(confianzaSlider.value);

        //Muestra generadas aleatoriamente
        const data = Array.from({length: n}, () => normRand(media, desviacion));

        //Histograma de distribución para la muestra
        const histTrace = {
            x: data,
            type: 'histogram',
            marker: {color: 'blue'}
        };

        const histLayout = {
            title: `Distribución Normal (Media=${media}, Desviación Estándar=${desviacion}, N=${n})`,
            xaxis: {title: 'Valor'},
            yaxis: {title: 'Frecuencia'},
            margin: {t: 30, b: 40, l: 50, r: 10}
        };

        Plotly.react('distribution-graph', [histTrace], histLayout);

        //Función de Densidad de Probabilidad (PDF) de la muestra
        const sem = desviacion / Math.sqrt(n); // Error estándar de la media
        const x = linspace(media - 4 * sem, media + 4 * sem, 1000);
        const pdf = x.map(val => gaussian(val, media, sem));

        //Linea de la función de densidad de probabilidad de la muestra
        const pdfTrace = {
            x: x,
            y: pdf,
            type: 'scatter',
            mode: 'lines',
            line: {color: 'blue'},
            name: 'Función de Densidad Muestra'
        };

        //Segunda curva para la distribución de la media poblacional
        const xPoblacional = linspace(37 - 4 * sem, 37 + 4 * sem, 1000);
        const pdfPoblacional = xPoblacional.map(val => gaussian(val, 37, sem));

        const pdfPoblacionalTrace = {
            x: xPoblacional,
            y: pdfPoblacional,
            type: 'scatter',
            mode: 'lines',
            line: {color: 'orange', dash: 'dot'},
            name: 'Función de Densidad Media Poblacional'
        };

        //Linea verde punteada para la media de la muestra
        const mediaLine = {
            x: [media, media],
            y: [0, Math.max(...pdf)],
            type: 'scatter',
            mode: 'lines',
            line: {color: 'green', dash: 'dash'},
            name: 'Media de la Muestra'
        };

        //Linea roja para la media poblacional
        const poblacionLine = {
            x: [37, 37],
            y: [0, Math.max(...pdf)],
            type: 'scatter',
            mode: 'lines',
            line: {color: 'red'},
            name: 'Media de la Población (37)'
        };

        //Valor crítico z basado en el nivel de confianza
        const alpha = 1 - (confianza / 100);
        const z = jStat.normal.inv(1 - (alpha / 2), 0, 1);

        //Intervalos de confianza
        const lowerBound = media - z * sem;
        const upperBound = media + z * sem;

        console.log('Confianza:', confianza, 'z:', z, 'SEM:', sem);
        console.log('Intervalo de Confianza:', lowerBound, upperBound);

        const xFill = linspace(lowerBound, upperBound, 100);
        const yFill = xFill.map(val => gaussian(val, media, sem));

        
        const fillArea = {
            x: [...xFill, ...xFill.slice().reverse()],
            y: [...yFill, ...Array(xFill.length).fill(0)],
            type: 'scatter',
            mode: 'none',
            fill: 'tozeroy',
            fillcolor: 'rgba(200, 0, 200, 0.2)',
            line: {color: 'purple', width: 0},
            showlegend: false,
            name: 'Área de Confianza'
        };

        
        const pdfLayout = {
            title: `Función de Densidad de Probabilidad`,
            xaxis: {
                title: 'Valor',
                range: [media - 4 * sem, media + 4 * sem]
            },
            yaxis: {title: 'Densidad'}
        };

        
        Plotly.react('pdf-graph', [pdfTrace, pdfPoblacionalTrace, mediaLine, poblacionLine, fillArea], pdfLayout);

        
        updateHypothesisResult(lowerBound, upperBound);
    }

    function updateHypothesisResult(lowerBound, upperBound) {
        const mediaPoblacional = 37;
        if (mediaPoblacional >= lowerBound && mediaPoblacional <= upperBound) {
            hypothesisResult.textContent = `La media poblacional (37) está dentro del intervalo de confianza.`;
            hypothesisResult.style.color = "green";
        } else {
            hypothesisResult.textContent = `La media poblacional (37) no está dentro del intervalo de confianza.`;
            hypothesisResult.style.color = "red";
        }
    }

    function normRand(mean, std) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return mean + std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    function linspace(start, stop, num) {
        const step = (stop - start) / (num - 1);
        return Array.from({length: num}, (v, i) => start + step * i);
    }

    function gaussian(x, mean, std) {
        return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
    }

    mediaSlider.addEventListener('input', function () {
        mediaValue.textContent = mediaSlider.value;
        updateGraphs();
    });

    desviacionSlider.addEventListener('input', function () {
        desviacionValue.textContent = desviacionSlider.value;
        updateGraphs();
    });

    nSlider.addEventListener('input', function () {
        nValue.textContent = nSlider.value;
        updateGraphs();
    });

    confianzaSlider.addEventListener('input', function () {
        confianzaValue.textContent = confianzaSlider.value;
        updateGraphs();
    });

    updateGraphs();
});















