function consultarResumoPorLocal() {
    let ano = document.getElementById("anoConsulta").value;
    let capturas = JSON.parse(localStorage.getItem("capturas")) || [];
    let filtradas = capturas.filter(c => c.data.startsWith(ano));
    let resumo = {};

    filtradas.forEach(c => {
        if (!resumo[c.local]) {
            resumo[c.local] = { totalCapturas: 0, totalPeso: 0 };
        }
        resumo[c.local].totalCapturas++;
        resumo[c.local].totalPeso += c.peso;
    });

    let resumoArray = Object.entries(resumo).sort((a, b) => b[1].totalCapturas - a[1].totalCapturas);

    let tabelaResumo = `<table>
        <tr>
            <th>Local</th>
            <th>Total Capturas</th>
            <th>Peso Total (g)</th>
        </tr>`;
    tabelaResumo += resumoArray.map(([local, dados]) => `
        <tr>
            <td>${local}</td>
            <td>${dados.totalCapturas.toLocaleString("pt-BR")}</td>
            <td>${dados.totalPeso.toLocaleString("pt-BR")}</td>
        </tr>
    `).join("");
    tabelaResumo += `</table>`;

    document.getElementById("resumoLocais").innerHTML = tabelaResumo;

    let labels = resumoArray.map(([local, _]) => local);
    let capturasData = resumoArray.map(([_, dados]) => dados.totalCapturas);
    let pesoData = resumoArray.map(([_, dados]) => dados.totalPeso);

    let tipoDado = document.getElementById("tipoDado").value;
    let dadosExibir = tipoDado === "capturas" ? capturasData : pesoData;
    let labelDado = tipoDado === "capturas" ? "Total Capturas" : "Peso Total (g)";
    let corBarra = tipoDado === "peso" ? "chartreuse" : document.getElementById("corBarra").value;

    if (window.myChart) {
        window.myChart.destroy();
    }

    let ctx = document.getElementById("graficoResumoPorLocal").getContext("2d");
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: labelDado,
                data: dadosExibir,
                backgroundColor: corBarra,
                borderColor: corBarra.replace('0.6', '1'),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: tipoDado === "capturas" ? "Total" : "Peso (g)"
                    },
                    ticks: {
                        callback: function (value, index, values) {
                            return value.toLocaleString('pt-BR');
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Locais'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `Resumo por Local (${ano}) - ${labelDado}`,
                    font: {
                        size: 18
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toLocaleString('pt-BR');
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}