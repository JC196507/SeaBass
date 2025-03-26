document.addEventListener("DOMContentLoaded", () => {
    carregarDados();
    atualizarLocaisOrdenados(); // Garante que a lista será ordenada no início
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log("Service Worker registrado!"))
    .catch(error => console.log("Erro no Service Worker:", error));
}

function atualizarLocaisOrdenados() {
    let localSelect = document.getElementById("local");
    let locais = [...localSelect.options].map(option => option.value).filter(v => v.trim() !== ""); // seleccão locais existentes e remoção vazios
    locais = locais.map(local => local.trim());

   	locais.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), "pt-BR"));

	localSelect.innerHTML = ""; // Limpa o select antes de preencher
    locais.forEach(local => {
        let option = document.createElement("option");
        option.value = local;
        option.textContent = local;
        localSelect.appendChild(option);
    });
}

function gravarCaptura() {
    let data = document.getElementById("dataCaptura").value;
    let peso = parseInt(document.getElementById("peso").value);
    let tamanho = parseInt(document.getElementById("tamanho").value);
    let localSelect = document.getElementById("local");
    let novoLocal = document.getElementById("novoLocal").value.trim();
    let local = novoLocal || localSelect.value;
    let tipoAmostra = document.getElementById("tipoAmostra").value;

    
	 if (!data || isNaN(peso) || peso <= 0 || isNaN(tamanho) || tamanho < 36 || !local || !tipoAmostra || new Date(data) > new Date()) {
        exibirMensagem('error', 'Preencha todos os campos corretamente e use uma data valida! Tamanho legal de pelo menos 36 cm.');
        return;
	 }

    let capturas = JSON.parse(localStorage.getItem("capturas")) || [];
    capturas.push({ data, peso, tamanho, local, tipoAmostra });
    localStorage.setItem("capturas", JSON.stringify(capturas));

    if (novoLocal && ![...localSelect.options].some(option => option.value.trim().toLowerCase() === novoLocal.toLowerCase())) {
        let newOption = document.createElement("option");
        newOption.value = novoLocal;
        newOption.textContent = novoLocal;
        localSelect.appendChild(newOption);
    }

    setTimeout(atualizarLocaisOrdenados, 0); // Chama a função para ordenar os locais
    exibirMensagem('success', 'Registro gravado com sucesso!');
    carregarDados();
}

function consultarCapturas() {
    let ano = document.getElementById("anoConsulta").value;
    let capturas = JSON.parse(localStorage.getItem("capturas")) || [];
    let filtradas = capturas.filter(c => c.data.startsWith(ano));
    filtradas.sort((a, b) => new Date(a.data) - new Date(b.data));

    let tabela = document.getElementById("tabelaCapturas").querySelector("tbody");
    tabela.innerHTML = "";

    filtradas.forEach((captura, index) => {
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