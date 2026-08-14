let kodeDaerah = {};
let kodeNomer = {};


// =============================
// VEHICLE NAMES
// =============================

const vehicleNames = {

    mobil_penumpang:
        "🚗 Mobil Penumpang",

    sepeda_motor:
        "🏍️ Sepeda Motor",

    mobil_bus:
        "🚌 Mobil Bus",

    mobil_barang:
        "🚚 Mobil Barang",

    kendaraan_khusus:
        "🚓 Kendaraan Khusus",

    mobil_barang_kendaraan_khusus:
        "🚚/🚓 Mobil Barang / Kendaraan Khusus"

};


// =============================
// LOAD DATABASE
// =============================

async function loadDatabase() {

    try {

        const [
            daerahResponse,
            nomerResponse
        ] = await Promise.all([

            fetch("./data/kode_daerah.json"),

            fetch("./data/kode_nomer.json")

        ]);

        if (!daerahResponse.ok || !nomerResponse.ok) {
            throw new Error("Database files could not be loaded.");
        }

        kodeDaerah =
            await daerahResponse.json();

        kodeNomer =
            await nomerResponse.json();

        console.log("PlateDecode database loaded.");

    } catch (error) {

        console.error(error);

        showError(
            "Database gagal dimuat. Pastikan folder data tersedia."
        );

    }

}


// =============================
// VEHICLE TYPE
// =============================

function getVehicleType(number, code) {

    let ranges;

    /*
        B uses Polda Metro Jaya ranges.
    */

    if (code === "B") {

        ranges =
            kodeNomer.polda_metro_jaya;

    } else {

        ranges =
            kodeNomer.general;

    }

    for (const [range, type] of Object.entries(ranges)) {

        const [
            minimum,
            maximum
        ] = range
            .split("-")
            .map(Number);

        if (
            number >= minimum &&
            number <= maximum
        ) {

            return type;

        }

    }

    return null;

}


// =============================
// REGION
// =============================

function getRegion(code, series) {

    const data =
        kodeDaerah[code];

    if (!data) {
        return null;
    }

    /*
        Simple format:

        "D": ["BANDUNG"]

        or:

        "B": [
            "JADETABEK",
            {
                "A": "...",
                "B": "..."
            }
        ]
    */

    const mainRegion =
        data[0];

    if (data.length === 1) {

        return mainRegion;

    }

    const suffixMap =
        data[1];

    const firstLetter =
        series.charAt(0);

    return (
        suffixMap[firstLetter] ||
        mainRegion
    );

}


// =============================
// PLATE FORMATTER
// =============================

function formatPlate(value) {

    /*
        Remove everything except
        letters and numbers.
    */

    value = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

    /*
        Indonesian plate:

        PREFIX
        NUMBER
        SERIES
    */

    const match = value.match(
        /^([A-Z]{1,2})(\d{1,4})([A-Z]{0,3})$/
    );

    if (!match) {

        return value;

    }

    const prefix =
        match[1];

    const number =
        match[2];

    const series =
        match[3];

    let formatted =
        `${prefix} ${number}`;

    if (series) {

        formatted +=
            ` ${series}`;

    }

    return formatted;

}


// =============================
// DECODE
// =============================

function decodePlate(plate) {

    plate =
        formatPlate(plate);

    const match =
        plate.match(
            /^([A-Z]{1,2})\s+(\d{1,4})(?:\s+([A-Z]{1,3}))?$/
        );

    if (!match) {

        showError(
            "Format plat tidak valid. Contoh: B 1234 ABC"
        );

        return;

    }

    const code =
        match[1];

    const number =
        Number(match[2]);

    const series =
        match[3] || "";

    // Check regional code

    if (!kodeDaerah[code]) {

        showError(
            `Kode daerah "${code}" tidak ditemukan.`
        );

        return;

    }

    // A series is recommended
    // for complete decoding.

    if (!series) {

        showError(
            "Masukkan seri plat. Contoh: B 1234 ABC"
        );

        return;

    }

    const vehicleType =
        getVehicleType(
            number,
            code
        );

    if (!vehicleType) {

        showError(
            "Nomor kendaraan berada di luar range yang tersedia."
        );

        return;

    }

    const region =
        getRegion(
            code,
            series
        );

    displayResult({

        plate,

        code,

        number,

        series,

        region,

        vehicleType

    });

}


// =============================
// DISPLAY RESULT
// =============================

function displayResult(data) {

    document
        .getElementById("result")
        .classList.remove("hidden");

    document
        .getElementById("error")
        .textContent = "";

    document
        .getElementById("resultPlate")
        .textContent =
            data.plate;

    document
        .getElementById("resultCode")
        .textContent =
            data.code;

    document
        .getElementById("resultNumber")
        .textContent =
            data.number;

    document
        .getElementById("resultSeries")
        .textContent =
            data.series;

    document
        .getElementById("resultRegion")
        .textContent =
            data.region;

    document
        .getElementById("resultVehicle")
        .textContent =
            vehicleNames[data.vehicleType] ||
            data.vehicleType;

}


// =============================
// ERROR
// =============================

function showError(message) {

    document
        .getElementById("result")
        .classList.add("hidden");

    document
        .getElementById("error")
        .textContent =
            message;

}


// =============================
// INPUT
// =============================

const plateInput =
    document.getElementById("plateInput");

plateInput.addEventListener(
    "input",
    event => {

        const cursorPosition =
            event.target.selectionStart;

        event.target.value =
            formatPlate(
                event.target.value
            );

        /*
            Keep cursor from behaving
            strangely after formatting.
        */

        try {

            event.target.setSelectionRange(
                cursorPosition,
                cursorPosition
            );

        } catch {}

    }
);


// =============================
// DECODE BUTTON
// =============================

document
    .getElementById("decodeBtn")
    .addEventListener(
        "click",
        () => {

            decodePlate(
                plateInput.value
            );

        }
    );


// =============================
// ENTER KEY
// =============================

plateInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            decodePlate(
                event.target.value
            );

        }

    }
);


// =============================
// EXAMPLE BUTTONS
// =============================

document
    .querySelectorAll("[data-plate]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const plate =
                    button.dataset.plate;

                plateInput.value =
                    plate;

                decodePlate(plate);

            }
        );

    });


// =============================
// COPYRIGHT YEAR
// =============================

document
    .getElementById("copyrightYear")
    .textContent =
        new Date().getFullYear();


// =============================
// START
// =============================

loadDatabase();