// ================================================================
//  DATA STORE
// ================================================================
let kodeDaerah = {};
let kodeNomer = {};
let kodeDiplomatik = {};

const vehicleNames = {
    mobil_penumpang: "🚗 Mobil Penumpang",
    sepeda_motor: "🏍️ Sepeda Motor",
    mobil_bus: "🚌 Mobil Bus",
    mobil_barang: "🚚 Mobil Barang",
    kendaraan_khusus: "🚓 Kendaraan Khusus",
    mobil_barang_kendaraan_khusus: "🚚/🚓 Mobil Barang / Kendaraan Khusus"
};

// ================================================================
//  LOAD DATABASE
// ================================================================
async function loadDatabase() {
    try {
        const [
            daerahResponse,
            nomerResponse,
            diplomatikResponse
        ] = await Promise.all([
            fetch("./data/kode_daerah.json"),
            fetch("./data/kode_nomer.json"),
            fetch("./data/kode_diplomatik.json")
        ]);

        if (
            !daerahResponse.ok ||
            !nomerResponse.ok ||
            !diplomatikResponse.ok
        ) {
            throw new Error("Database files could not be loaded.");
        }

        kodeDaerah = await daerahResponse.json();
        kodeNomer = await nomerResponse.json();
        kodeDiplomatik = await diplomatikResponse.json();

        console.log("PlateDecode database loaded.");
    } catch (error) {
        console.error(error);

        showError(
            "Database gagal dimuat. Pastikan folder data tersedia."
        );
    }
}

// ================================================================
//  VEHICLE TYPE
// ================================================================
function getVehicleType(number, code) {
    const ranges =
        code === "B"
            ? kodeNomer.polda_metro_jaya
            : kodeNomer.general;

    if (!ranges) return null;

    for (const [range, type] of Object.entries(ranges)) {
        const [min, max] = range.split("-").map(Number);

        if (number >= min && number <= max) {
            return type;
        }
    }

    return null;
}

// ================================================================
//  REGION
// ================================================================
function getRegion(code, series) {
    const data = kodeDaerah[code];

    if (!data) return null;

    const mainRegion = data[0];

    if (data.length === 1) {
        return mainRegion;
    }

    const suffixMap = data[1];
    const firstLetter = series.charAt(0);

    return suffixMap[firstLetter] || mainRegion;
}

// ================================================================
//  PLATE FORMATTER
// ================================================================
function formatPlate(value) {
    value = value.toUpperCase();

    // ============================================================
    // DIPLOMATIC PLATE
    // Keep user-entered spaces while typing
    // ============================================================
    if (value.startsWith("CD")) {
        // Allow letters, numbers, and spaces
        value = value.replace(/[^A-Z0-9 ]/g, "");

        // Preserve a trailing space while typing
        const hasTrailingSpace = /\s$/.test(value);

        // Normalize multiple spaces
        let parts = value.trim().split(/\s+/);

        // Always keep CD as the prefix
        if (parts[0] === "CD") {
            parts = parts.slice(0, 3);
        }

        let formatted = parts.join(" ");

        // IMPORTANT:
        // If the user pressed space, keep it.
        if (hasTrailingSpace) {
            formatted += " ";
        }

        return formatted;
    }

    // ============================================================
    // NORMAL PLATE
    // ============================================================
    value = value.replace(/[^A-Z0-9]/g, "");

    let prefix = "";
    let number = "";
    let series = "";

    for (const char of value) {
        if (
            prefix.length < 2 &&
            /[A-Z]/.test(char) &&
            number === ""
        ) {
            prefix += char;
        } else if (
            number.length < 4 &&
            /\d/.test(char) &&
            series === ""
        ) {
            number += char;
        } else if (
            series.length < 3 &&
            /[A-Z]/.test(char)
        ) {
            series += char;
        }
    }

    let formatted = "";

    if (prefix) {
        formatted += prefix;
    }

    if (number) {
        if (formatted) formatted += " ";
        formatted += number;
    }

    if (series) {
        if (formatted) formatted += " ";
        formatted += series;
    }

    return formatted;
}

// ================================================================
//  CURSOR POSITION
// ================================================================
function getNewCursorPosition(
    oldValue,
    newValue,
    oldCursor
) {
    if (oldCursor >= oldValue.length) {
        return newValue.length;
    }

    const oldSpaces = (
        oldValue
            .slice(0, oldCursor)
            .match(/ /g) || []
    ).length;

    const oldCharIndex =
        oldCursor - oldSpaces;

    const cleanOld = oldValue
        .replace(/[^A-Z0-9]/g, "")
        .toUpperCase();

    const cleanNew = newValue
        .replace(/[^A-Z0-9]/g, "")
        .toUpperCase();

    if (oldCharIndex > cleanOld.length) {
        return newValue.length;
    }

    let cleanIndex = 0;
    let newIndex = 0;

    while (
        newIndex < newValue.length &&
        cleanIndex < oldCharIndex
    ) {
        if (/[A-Z0-9]/.test(newValue[newIndex])) {
            cleanIndex++;
        }

        newIndex++;
    }

    return newIndex;
}

// ================================================================
//  DIPLOMATIC PLATE DECODER
// ================================================================
function decodeDiplomaticPlate(plate) {
    plate = plate.toUpperCase().trim();

    // ============================================================
    // DIPLOMATIC FORMAT
    // CD [KODE NEGARA] [NOMOR REGISTRASI]
    //
    // Example:
    // CD 14 09
    // CD 12 5
    // CD 145 5
    // ============================================================

    const match = plate.match(
        /^CD\s+(\d{1,3})\s+(\d{1,4})$/
    );

    if (!match) {
        showError(
            "Format plat diplomatik tidak valid. Contoh: CD 14 09"
        );
        return;
    }

    const countryCode = match[1];
    const registrationNumber = match[2];

    const representation =
        kodeDiplomatik[countryCode];

    if (!representation) {
        showError(
            `Kode diplomatik "${countryCode}" tidak ditemukan.`
        );
        return;
    }

    displayDiplomaticResult({
        plate: `CD ${countryCode} ${registrationNumber}`,
        code: countryCode,
        number: registrationNumber,
        representation
    });
}

// ================================================================
//  DIPLOMATIC RESULT
// ================================================================
function displayDiplomaticResult(data) {
    document
        .getElementById("result")
        .classList.remove("hidden");

    document.getElementById("error").textContent = "";

    // Change labels for diplomatic plates
    const resultItems =
        document.querySelectorAll(".result-item");

    resultItems[0].querySelector("span").textContent =
        "Kode";

    resultItems[1].querySelector("span").textContent =
        "Nomor";

    resultItems[2].querySelector("span").textContent =
        "Kode Negara";

    resultItems[3].querySelector("span").textContent =
        "Negara";

    // Values
    document.getElementById("resultPlate").textContent =
        data.plate;

    document.getElementById("resultCode").textContent =
        "CD";

    document.getElementById("resultNumber").textContent =
        data.number;

    document.getElementById("resultSeries").textContent =
        data.code;

    document.getElementById("resultRegion").textContent =
        data.representation;

    document.getElementById("resultVehicle").textContent =
        "🏛️ Kendaraan Diplomatik";
}

// ================================================================
//  NORMAL PLATE DECODER
// ================================================================
function decodeNormalPlate(plate) {
    const match = plate.match(
        /^([A-Z]{1,2})\s+(\d{1,4})(?:\s+([A-Z]{1,3}))?$/
    );

    if (!match) {
        showError(
            "Format plat tidak valid. Contoh: B 1234 ABC"
        );

        return;
    }

    const code = match[1];
    const number = Number(match[2]);
    const series = match[3] || "";

    if (!kodeDaerah[code]) {
        showError(
            `Kode daerah "${code}" tidak ditemukan.`
        );

        return;
    }

    if (!series) {
        showError(
            "Masukkan seri plat. Contoh: B 1234 ABC"
        );

        return;
    }

    const vehicleType =
        getVehicleType(number, code);

    if (!vehicleType) {
        showError(
            "Nomor kendaraan berada di luar range yang tersedia."
        );

        return;
    }

    const region =
        getRegion(code, series);

    displayResult({
        plate,
        code,
        number,
        series,
        region,
        vehicleType
    });
}

// ================================================================
//  DECODE
// ================================================================
function decodePlate(input) {
    const plate = formatPlate(input);

    if (!plate) {
        showError(
            "Masukkan nomor plat terlebih dahulu."
        );

        return;
    }

    /*
        Detect diplomatic plates first.

        CD 12 5
        CD 27 09
        CD 145 3
    */

    if (plate.startsWith("CD ")) {
        decodeDiplomaticPlate(plate);
        return;
    }

    // Normal Indonesian plate
    decodeNormalPlate(plate);
}

// ================================================================
//  DISPLAY NORMAL RESULT
// ================================================================
function displayResult(data) {
    document
        .getElementById("result")
        .classList.remove("hidden");

    document.getElementById("error").textContent = "";

    // Restore normal plate labels
    const resultItems =
        document.querySelectorAll(".result-item");

    resultItems[0].querySelector("span").textContent =
        "Kode Daerah";

    resultItems[1].querySelector("span").textContent =
        "Nomor";

    resultItems[2].querySelector("span").textContent =
        "Seri";

    resultItems[3].querySelector("span").textContent =
        "Wilayah";

    // Values
    document.getElementById("resultPlate").textContent =
        data.plate;

    document.getElementById("resultCode").textContent =
        data.code;

    document.getElementById("resultNumber").textContent =
        data.number;

    document.getElementById("resultSeries").textContent =
        data.series;

    document.getElementById("resultRegion").textContent =
        data.region;

    document.getElementById("resultVehicle").textContent =
        vehicleNames[data.vehicleType] ||
        data.vehicleType;
}

// ================================================================
//  ERROR
// ================================================================
function showError(message) {
    document
        .getElementById("result")
        .classList.add("hidden");

    document.getElementById("error").textContent =
        message;
}

// ================================================================
//  INPUT HANDLING
// ================================================================
const plateInput =
    document.getElementById("plateInput");

plateInput.addEventListener("input", (event) => {
    const input = event.target;

    const oldValue = input.value;
    const oldCursor = input.selectionStart;

    const formatted =
        formatPlate(input.value);

    if (formatted === oldValue) {
        return;
    }

    input.value = formatted;

    const newCursor =
        getNewCursorPosition(
            oldValue,
            formatted,
            oldCursor
        );

    requestAnimationFrame(() => {
        input.setSelectionRange(
            newCursor,
            newCursor
        );
    });
});

// ================================================================
//  BUTTON
// ================================================================
document
    .getElementById("decodeBtn")
    .addEventListener("click", () => {
        decodePlate(plateInput.value);
    });

// ================================================================
//  ENTER KEY
// ================================================================
plateInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();

        decodePlate(plateInput.value);
    }
});

// ================================================================
//  EXAMPLE BUTTONS
// ================================================================
document
    .querySelectorAll("[data-plate]")
    .forEach((btn) => {
        btn.addEventListener("click", () => {
            const plate =
                btn.dataset.plate;

            plateInput.value = plate;

            decodePlate(plate);
        });
    });

// ================================================================
//  COPYRIGHT
// ================================================================
document.getElementById(
    "copyrightYear"
).textContent =
    new Date().getFullYear();

// ================================================================
//  INIT
// ================================================================
loadDatabase();