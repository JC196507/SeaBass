document.addEventListener("DOMContentLoaded", () => {
    carregarDados();
    preencherAnos();

    document.getElementById("concelho").addEventListener("change", function() {
        atualizarLocaisOrdenados();
    });
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(() => console.log("Service Worker registrado!"))
        .catch(error => console.log("Erro no Service Worker:", error));
}

function carregarDados() {
    let concelhoSelect = document.getElementById("concelho");
    let localSelect = document.getElementById("local");

    concelhoSelect.innerHTML = '<option value="">Selecione um concelho</option>';
    localSelect.innerHTML = '<option value="">Selecione um local</option>';

    concelhosLocais.forEach(concelho => {
        let option = document.createElement("option");
        option.value = concelho.concelho;
        option.textContent = concelho.concelho;
        concelhoSelect.appendChild(option);
    });
}

function atualizarLocaisOrdenados() {
    let concelhoSelect = document.getElementById("concelho");
    let localSelect = document.getElementById("local");
    let concelhoSelecionado = concelhoSelect.value;

    localSelect.innerHTML = '<option value="">Selecione um local</option>';

    if (concelhoSelecionado) {
        let concelhoEncontrado = concelhosLocais.find(c => c.concelho === concelhoSelecionado);
        if (concelhoEncontrado) {
            concelhoEncontrado.locais.forEach(local => {
                let option = document.createElement("option");
                option.value = local;
                option.textContent = local;
                localSelect.appendChild(option);
            });
        }
    }
}

function gravarCaptura() {
    let data = document.getElementById("dataCaptura").value;
    let peso = parseInt(document.getElementById("peso").value);
    let tamanho = parseInt(document.getElementById("tamanho").value);
    let concelho = document.getElementById("concelho").value;
    let localSelect = document.getElementById("local");
    let local = localSelect.value;
    let tipoAmostra = document.getElementById("tipoAmostra").value;

    if (!data || isNaN(peso) || peso <= 0 || isNaN(tamanho) || tamanho < 36 || !concelho || !local || !tipoAmostra || new Date(data) > new Date()) {
        exibirMensagem('error', 'Preencha todos os campos correctamente e use uma data válida! Tamanho legal de pelo menos 36 cm.');
        return;
    }

    let capturas = JSON.parse(localStorage.getItem("capturas")) || [];
    capturas.push({ data, peso, tamanho, local, tipoAmostra });
    localStorage.setItem("capturas", JSON.stringify(capturas));

    setTimeout(atualizarLocaisOrdenados, 0);
    exibirMensagem('success', 'Registro gravado com sucesso!');
    carregarDados();
    preencherAnos(); // Adicionado para actualizar os anos após gravar
}

function consultarCapturas() {
    let ano = document.getElementById("anoConsulta").value;
    let capturas = JSON.parse(localStorage.getItem("capturas")) || [];
    let filtradas = capturas.filter(c => c.data.startsWith(ano));
    filtradas.sort((a, b) => new Date(a.data) - new Date(b.data));

    let tabela = document.getElementById("tabelaCapturas").querySelector("tbody");
    tabela.innerHTML = "";

    filtradas.forEach(captura => {
        let linha = tabela.insertRow();
        let data = new Date(captura.data);
        let dataFormatada = data.toLocaleDateString("pt-pt");

        linha.insertCell(0).textContent = dataFormatada;
        linha.insertCell(1).textContent = captura.peso.toLocaleString("pt-BR");
        linha.insertCell(2).textContent = captura.tamanho;
        linha.insertCell(3).textContent = captura.local;
        linha.insertCell(4).textContent = captura.tipoAmostra;

        let btnRemover = document.createElement("button");
        btnRemover.textContent = "X";
        btnRemover.style.padding = "5px 10px";
        btnRemover.style.fontSize = "16px";
        btnRemover.style.width = "35px";
        btnRemover.style.height = "35px";
        btnRemover.style.border = "none";
        btnRemover.style.backgroundColor = "#ff4d4d";
        btnRemover.style.color = "#ffffff";
        btnRemover.style.borderRadius = "50%";
        btnRemover.style.cursor = "pointer";
        btnRemover.style.display = "block";
        btnRemover.style.margin = "0 auto";
        btnRemover.innerHTML = '<i class="fa fa-trash"></i>';
        btnRemover.onclick = () => removerCaptura(captura.data, captura.peso, captura.tamanho, captura.local, captura.tipoAmostra);
        linha.insertCell(5).appendChild(btnRemover);
    });

    document.getElementById("totaisAno").textContent = `Total de capturas: ${filtradas.length}, Peso total: ${filtradas.reduce((acc, c) => acc + c.peso, 0).toLocaleString("pt-BR")}g`;
}

function removerCaptura(data, peso, tamanho, local, tipoAmostra) {
    if (confirm("Tem certeza que deseja remover esta captura?")) {
        let capturas = JSON.parse(localStorage.getItem("capturas")) || [];
        let index = capturas.findIndex(c => c.data === data && c.peso === peso && c.tamanho === tamanho && c.local === local && c.tipoAmostra === tipoAmostra);

        if (index !== -1) {
            capturas.splice(index, 1);
            localStorage.setItem("capturas", JSON.stringify(capturas));
            consultarCapturas();
            exibirMensagem("success", "Captura removida com sucesso!");
        } else {
            exibirMensagem("error", "Erro ao remover a captura.");
        }
    }
}

function limparTabelaCapturas() {
    const tabelaBody = document.getElementById("tabelaCapturas").querySelector("tbody");
    tabelaBody.innerHTML = ""; // Limpa todas as linhas da tabela
    document.getElementById("totaisAno").textContent = ""; // Limpa o texto dos totais
}

function limparAnalise() {
    document.getElementById("resumoLocais").innerHTML = ""; // Limpa a tabela de resumo
    const graficoCanvas = document.getElementById("graficoResumoPorLocal");
    const ctx = graficoCanvas.getContext('2d');
    ctx.clearRect(0, 0, graficoCanvas.width, graficoCanvas.height); // Limpa o canvas

    // Se você estiver a usar uma instância global do Chart (window.myChart), destrua-a
    if (window.myChart) {
        window.myChart.destroy();
        window.myChart = null; // Limpe a referência
    }
}

function preencherAnos() {
    let capturas = JSON.parse(localStorage.getItem("capturas")) || [];
    let anos = [...new Set(capturas.map(c => new Date(c.data).getFullYear()))].sort((a, b) => b - a);
    let anoSelect = document.getElementById("anoConsulta");
    anoSelect.innerHTML = ""; // Limpa o select antes de preencher

    anos.forEach(ano => {
        let option = document.createElement("option");
        option.value = ano;
        option.textContent = ano;
        anoSelect.appendChild(option);
    });
}