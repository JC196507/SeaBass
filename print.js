// print.js

window.imprimirCapturas = function () {
    try {
        let ano = document.getElementById("anoConsulta").value;
        let capturas = JSON.parse(localStorage.getItem("capturas")) || [];
        let filtradas = capturas.filter(c => c.data.startsWith(ano));
        filtradas.sort((a, b) => new Date(a.data) - new Date(b.data));
        let totalCapturas = filtradas.length;
        let pesoTotal = filtradas.reduce((acc, c) => acc + c.peso, 0);

        let janelaImpressao = window.open("", "_blank");
        janelaImpressao.document.write(`
            <html>
            <head>
                <title>Capturas de Robalo - ${ano}</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; color: #000080; }
                    table { width: 100%; border-collapse: collapse; text-align: center; margin-top: 20px; }
                    table, th, td { border: 1px solid black; }
                    th, td { padding: 10px; }
                    th { background-color: #1E90FF; color: white; }
                    h2 { color: #000080; }
                </style>
            </head>
            <body>
                <h2>Relatorio de Capturas de Robalo - ${ano}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Peso (g)</th>
                            <th>Tamanho (cm)</th>
                            <th>Tipo de Amostra</th>
                            <th>Local</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtradas.map(captura => `
                            <tr>
                                <td>${new Date(captura.data).toLocaleDateString("pt-pt")}</td>
                                <td>${captura.peso.toLocaleString("pt-BR")}</td>
                                <td>${captura.tamanho}</td>
                                <td>${captura.tipoAmostra}</td>
                                <td>${captura.local}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
                <h3>Total de capturas: ${totalCapturas}</h3>
                <h3>Peso total: ${pesoTotal.toLocaleString("pt-BR")}g</h3>
            </body>
            </html>
        `);
        janelaImpressao.document.close();
        janelaImpressao.print();
    } catch (error) {
        console.error("Erro ao imprimir capturas:", error);
        alert("Ocorreu um erro ao imprimir as capturas. Consulte o console para mais detalhes.");
    }
}

window.abrirResumoGeral = function () {
    try {
        let capturas = JSON.parse(localStorage.getItem("capturas")) || [];
        let anos = [...new Set(capturas.map(c => c.data.substring(0, 4)))];
        let resumoPorAno = {};
        let resumoGeral = { totalCapturas: 0, totalPeso: 0, locais: {}, amostras: {} };

        anos.forEach(ano => {
            resumoPorAno[ano] = {
                totalCapturas: 0,
                totalPeso: 0,
                locais: {},
                amostras: {},
                robaloMaisPesado: { peso: 0, data: '' },
                meses: {}
            };
        });

        capturas.forEach(c => {
            let ano = c.data.substring(0, 4);
            let mes = new Date(c.data).getMonth();
            resumoPorAno[ano].totalCapturas++;
            resumoPorAno[ano].totalPeso += c.peso;
            resumoGeral.totalCapturas++;
            resumoGeral.totalPeso += c.peso;

            resumoPorAno[ano].locais[c.local] = (resumoPorAno[ano].locais[c.local] || 0) + 1;
            resumoGeral.locais[c.local] = (resumoGeral.locais[c.local] || 0) + 1;

            resumoPorAno[ano].amostras[c.tipoAmostra] = (resumoPorAno[ano].amostras[c.tipoAmostra] || 0) + 1;
            resumoGeral.amostras[c.tipoAmostra] = (resumoGeral.amostras[c.tipoAmostra] || 0) + 1;

            if (c.peso > resumoPorAno[ano].robaloMaisPesado.peso) {
                resumoPorAno[ano].robaloMaisPesado.peso = c.peso;
                resumoPorAno[ano].robaloMaisPesado.data = c.data;
            }

            resumoPorAno[ano].meses[mes] = (resumoPorAno[ano].meses[mes] || 0) + 1;
        });

        function encontrarLocalMaisCapturas(locais, total) {
            if (Object.keys(locais).length === 0) return 'N/A';
            let local = Object.keys(locais).reduce((a, b) => locais[a] > locais[b] ? a : b);
            let percentagem = total > 0 ? ((locais[local] / total) * 100).toFixed(2) + '%' : 'N/A';
            return `${local} (${percentagem})`;
        }

        function encontrarAmostraMaisUsada(amostras, total) {
            let amostra = Object.keys(amostras).reduce((a, b) => amostras[a] > amostras[b] ? a : b, null);
            let percentagem = total > 0 ? ((amostras[amostra] / total) * 100).toFixed(2) + '%' : 'N/A';
            return amostra ? `${amostra} (${percentagem})` : 'N/A';
        }

        function encontrarMesMaisCapturas(meses) {
            if (Object.keys(meses).length === 0) return 'N/A';
            let mes = Object.keys(meses).reduce((a, b) => meses[a] > meses[b] ? a : b);
            let nomeMes = new Date(2000, mes, 1).toLocaleString('default', { month: 'long' });
            let total = Object.values(meses).reduce((acc, val) => acc + val, 0);
            let percentagem = ((meses[mes] / total) * 100).toFixed(2) + '%';
            return `${nomeMes} (${percentagem})`;
        }

        let html = `
            <html>
            <head><title>Resumo Geral de Capturas</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                th { background-color: #f2f2f2; }
                .total { font-weight: bold; background-color: #e0e0e0; }
                button { margin-top: 20px; padding: 10px 20px; cursor: pointer; }
                @media print { button { display: none; } }
            </style>
            </head>
            <body>
                <h2>Resumo Geral de Capturas</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Ano</th>
                            <th>Total Capturas</th>
                            <th>Peso Total (g)</th>
                            <th>Robalo Mais Pesado (g)</th>
                            <th>Mes Mais Capturas</th>
                            <th>Local Mais Capturas</th>
                            <th>Amostra Mais Usada</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${anos.map(ano => `
                            <tr>
                                <td>${ano}</td>
                                <td>${resumoPorAno[ano].totalCapturas.toLocaleString('pt-BR')}</td>
                                <td>${resumoPorAno[ano].totalPeso.toLocaleString('pt-BR')}</td>
                                <td>${resumoPorAno[ano].robaloMaisPesado.peso.toLocaleString('pt-BR')}</td>
                                <td>${encontrarMesMaisCapturas(resumoPorAno[ano].meses)}</td>
                                <td>${encontrarLocalMaisCapturas(resumoPorAno[ano].locais, resumoPorAno[ano].totalCapturas)}</td>
                                <td>${encontrarAmostraMaisUsada(resumoPorAno[ano].amostras, resumoPorAno[ano].totalCapturas)}</td>
                            </tr>
                        `).join('')}
                        <tr class="total">
                            <td>Geral</td>
                            <td>${resumoGeral.totalCapturas}</td>
                            <td>${resumoGeral.totalPeso.toLocaleString('pt-BR')}</td>
                            <td>-</td>
                            <td>-</td>
                            <td>${encontrarLocalMaisCapturas(resumoGeral.locais, resumoGeral.totalCapturas)}</td>
                            <td>${encontrarAmostraMaisUsada(resumoGeral.amostras, resumoGeral.totalCapturas)}</td>
                        </tr>
                    </tbody>
                </table>
                <button onclick="window.print()">Imprimir</button>
            </body>
            </html>
        `;

        let novaJanela = window.open('', '_blank');
        novaJanela.document.write(html);
    } catch (error) {
        console.error("Erro ao abrir resumo geral:", error);
        alert("Ocorreu um erro ao abrir o resumo geral. Consulte o console para mais detalhes.");
    }
}

console.log(window.imprimirCapturas, window.abrirResumoGeral); // Verifica se as funções estão definidas