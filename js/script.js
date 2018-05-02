/**
 * Relatório de eventos
 */
class Report {
	constructor() {
		this.report = $("#log .body");
		this.clear();
	}

	clear() {
		this.report.html("");
		this.log("Log pronto para relatório.");
	}

	log(info) {
		this.report.append("<p>[<span class='accent'>" + dateFormat(new Date(), "dd/mm/yyyy HH:MM:ss.L") + "</span>] " + info + "</p>");
	}
}

/**
 * Painel de estatísticas
 */
class Stat {
	constructor() {
		this.accesses = $("#accesses");
		this.hits = $("#hits");
		this.misses = $("#misses");
		this.reads = $("#reads");
		this.writes = $("#writes");
		this.readHits = $("#readHits");
		this.writeHits = $("#writeHits");
		this.readMisses = $("#readMisses");
		this.writeMisses = $("#writeMisses");
	}

	addAccess() {

	}

	addHit() {

	}

	addMiss() {

	}

	addRead() {

	}

	addWrite() {

	}

	addReadHit() {

	}

	addWriteHit() {

	}

	addReadMiss() {

	}

	addWriteMiss() {

	}
}

/**
 * Memória principal
 */
class Ram {
	constructor(cells, size) {
		this.grid = $("#ram tbody");
		this.cells = cells;
		this.size = size;
		this.blocks = cells / size;

		this.create();
		this.generate();
		this.fill();
	}

	create() {
		$report = new Report();
		$stat = new Stat();

		$report.log("Iniciando criação da estrutura da memória principal...");

		this.data = [];
		
		$report.log("Calculando tamanho do endereço...");
		var size = Math.log(this.cells) / Math.log(2);
		var mask = "0".repeat(size);
		
		$report.log("Registrando endereços na memória principal...");
		for (var i = 0; i < this.cells; i++) {
			this.data.push({
				"address": (mask + i.toString(2)).slice(-size),
				"block": parseInt(i / this.size),
				"disp": i % this.size
			});
		}

		$report.log("Estrutura finalizada com sucesso!");
		$report.log("Foi(foram) registrado(s) " + this.cells + " endereço(s) na memória principal.");

		$cache = new Cache(this);
	}

	generate() {
		$report.log("Gerando caractere(s) aleatório(s)...");

		for (var i = 0; i < this.cells; i++) {
			this.data[i].char = String.fromCharCode(Math.floor(Math.random() * (94)) + 33);
		}

		$report.log("Caractere(s) gerado(s) com sucesso!");
		$report.log("Foi(foram) gerado(s) " + this.cells + " caractere(s).");
	}

	fill() {
		$report.log("Iniciando o processo de preenchimento da tabela...");

		$report.log("Limpando os dados antigos...");
		this.grid.html("");

		$report.log("Preenchendo a tabela...");
		for (var data in this.data) {
			this.grid.append("<tr><td>" + this.data[data].address + "</td><td>" + this.data[data].block + "</td><td>" + this.data[data].char + "</td></tr>");
		}

		$report.log("Preenchimento finalizado com sucesso!");
		$report.log("Todos os registros foram inseridos na tabela.");
	}

	read(address) {
		return this.data[address.toString(10)].char;
	}

	write(address, char) {
		$report.log("Iniciando o processo de escrita na memória principal...");

		$report.log("Reconhecendo o endereço informado...");
		address = address.toString(10);
		
		$report.log("Alterando o registro da memória principal...");
		var oldChar = this.data[address].char;
		this.data[address].char = char.trim().charAt(0);

		$report.log("O registro foi atualizado com sucesso!");
		$report.log("O dado do endereço " + address + " foi alterado de " + oldChar + " para " + this.data[address].char + ".");
	}
}

/**
 * Memória cache
 */
class Cache {
	constructor(ram) {
		this.head = $("#cache thead tr");
		this.grid = $("#cache tbody");
		this.cells = ram.cells;
		this.size = ram.size;
		this.blocks = this.cells / this.size;

		this.create();
	}

	create() {
		this.data = [];

		this.head.children().each(function() {
			if ($(this).prop("id") == "") {
				$(this).detach();
			}
		});

		for (var i = this.size - 1; i >= 0; i--) {
			this.head.find("#frames").after("<th>Célula " + i + "</th>")
		}

		var size = (Math.log(this.cells) / Math.log(2)) - (Math.log(this.size) / Math.log(2));
		var mask = "0".repeat(size);

		for (var i = 0; i < 16; i++) {
			this.data.push({
				"label": (mask + i.toString(2)).slice(-size),
				"valid": "<i class='fa fa-circle' style='color: var(--default);'></i>",
				"block": ""
			});

			for (var j = 0; j < this.size; j++) {
				this.data[i]["cell_" + j] = "<i class='fa fa-minus' style='color: var(--default);'></i>";
			}
		}

		this.fill();
	}

	fill() {
		this.grid.html("");

		for (var data in this.data) {
			this.grid.append("<tr id='cache_" + this.data[data].label + "'></tr>");

			var row = this.grid.children().last("tr");

			row.append("<td>" + this.data[data].label + "</td>");
			row.append("<td>" + data + "</td>");

			for (var j = 0; j < this.size; j++) {
				row.append("<td>" + this.data[data]["cell_" + j] + "</td>");
			}

			row.append("<td>" + this.data[data].valid + "</td>");
		}
	}

	read(address) {
		this.data[1]["cell_2"] = "C";

		var valid = false;

		for (var data in $ram.data) {
			if ($ram.data[data].address == address) {
				valid = true;
				break;
			}
		}
		
		if (valid) {
			var label = address.substr(0, (address.length - (Math.log(this.size) / Math.log(2))));
			
			var found = false;

			for (var data in this.data) {
				if (this.data[data].block == label) {
					found = this.data[data]["cell_" + $ram.data[parseInt(address, 2)].disp];
					break;
				}
			}

			if (!found) {
				this.write(label);
				found = this.read(address);
			}

			return found ? found : "";
		}

		return false;
	}

	write(block) {
		var empty = false;

		for (var data in this.data) {
			if (this.data[data].block == "") {
				empty = true;
				break;
			}
		}

		if (!empty) {
			data = Math.floor(Math.random() * (16));
		}

		for (var i = 0; i < this.size; i++) {
			this.data[data]["cell_" + i] = $ram.data[parseInt(block + i.toString(2), 2)].char;
		}

		this.data[data].block = block;

		this.fill();
	}
}


/**
 * Objetos
 */
var $report;
var $stat;
var $cache;

var $ram = new Ram(1024, 4);

/**
 * Entradas
 */
var $address = $("#address");
var $value = $("#value");

/**
 * Botões
 */
var $read = $("#read");
var $write = $("#write");

/**
 * Funções
 */
$read.click(function() {
	var value = $cache.read($address.val());

	// console.log(value);

	if (value) {
		$value.val(value.char);
	} else {
		alert("Endereço inválido!");
		$address.focus();
	}
});

$write.click(function() {
	$cache.write($address.val(), $value.val());
});