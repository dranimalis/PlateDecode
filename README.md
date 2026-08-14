# 🇮🇩 PlateDecode

A lightweight Indonesian vehicle license plate decoder built with
**HTML, CSS, and vanilla JavaScript**.

PlateDecode lets you enter an Indonesian license plate and get information
about its registration area and vehicle category.

## ✨ Features

- 🇮🇩 Indonesian license plate decoding
- 📍 Registration area detection
- 🔢 Vehicle number classification
- 🚗 Vehicle type detection
- 🔤 Automatic uppercase formatting
- ✨ Automatic plate formatting
- 📱 Responsive design
- ⚡ No frameworks
- 📦 No dependencies
- 🗄️ No backend required

## 🔎 Example

Enter:

```text
B 1234 ABC
````

PlateDecode will process:

```text
Kode Daerah   : B
Nomor         : 1234
Seri          : ABC
Wilayah       : Jakarta Barat
Jenis         : 🚗 Mobil Penumpang
```

The exact region depends on the plate's area code and series.

## 🛠️ Tech Stack

* HTML5
* CSS3
* Vanilla JavaScript
* JSON

No external libraries or frameworks are required.

## 📁 Project Structure

```text
PlateDecode/
├── index.html
├── style.css
├── script.js
│
├── data/
│   ├── kode_daerah.json
│   └── kode_nomer.json
│
├── LICENSE
├── README.md
└── .gitignore
```

## 🚀 Running Locally

Clone the repository:

```bash
git clone https://github.com/Dr_Animalis/PlateDecode.git
```

Enter the directory:

```bash
cd PlateDecode
```

Start a local web server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

> A local web server is recommended because the application loads its
> JSON databases using `fetch()`.

## 🌐 Deployment

PlateDecode is a static website, so it can be deployed to any static
web hosting service that supports HTML, CSS, JavaScript, and JSON files.

No backend or database server is required.

## 📊 Data

PlateDecode uses JSON files for its plate data:

```text
data/kode_daerah.json
data/kode_nomer.json
```

The regional-code dataset was based on the work of
**Riyanto Wibowo**:

* Repository:
  [https://github.com/riyantowibowo/indonesian-vehicle-license-plate-numbers](https://github.com/riyantowibowo/indonesian-vehicle-license-plate-numbers)
* Author:
  [https://github.com/riyantowibowo](https://github.com/riyantowibowo)

The original repository provides Indonesian vehicle license plate
area-code data and documents the structure of Indonesian civilian
license plates. ([GitHub][1])

Please refer to the original repository for the original dataset
and its attribution information.

## 🙏 Credits

### Regional Plate Data

Special thanks to **Riyanto Wibowo** for the Indonesian vehicle
license plate area-code dataset used as a reference for this project.

> [https://github.com/riyantowibowo/indonesian-vehicle-license-plate-numbers](https://github.com/riyantowibowo/indonesian-vehicle-license-plate-numbers)

The original project credits **Auto2000** as the source for its
regional-code data. ([GitHub][1])

### PlateDecode

Created and maintained by **Dr_Animalis**.

## ⚠️ Disclaimer

PlateDecode is an independent open-source project.

It is not affiliated with, endorsed by, or officially connected to
the Indonesian government or any Indonesian government agency.

The information provided by this project is for informational and
educational purposes. Plate data may change over time, so results
should not be treated as an official verification of a vehicle's
registration.

## 📄 License

PlateDecode is licensed under the MIT License.

Copyright © 2026 Dr_Animalis.

See [`LICENSE`](LICENSE) for the full license text.

---

Made by **Dr_Animalis**
