document.addEventListener('DOMContentLoaded', function() {
    const santriTable = document.getElementById('santri-table');
    const filterTingkatanSelect = document.getElementById('filter-tingkatan'); // Renamed for clarity
    const tingkatanTable = document.getElementById('tingkatan-table');
    const tingkatanDetailTable = document.getElementById('santri-in-tingkatan-table');
    const tingkatanNameHeader = document.getElementById('tingkatan-name');
    const absensiTableContainer = document.getElementById('absensi-table-container');
    const filterJamSelect = document.getElementById('filter-jam'); // New filter
    const filterTanggalSelect = document.getElementById('filter-tanggal'); // New filter

    // --- Helper: Get Jam Pelajaran based on Tingkatan ---
    function getJamPelajaran(tingkatan) {
        if (tingkatan.startsWith('TPQ')) {
            return ['Sore'];
        } else {
            return ['Sore', 'Malam Jam 1', 'Malam Jam 2'];
        }
    }

    // --- Helper: Format Date (YYYY-MM-DD to DD MMM) ---
    function formatDate(dateString) {
        const months = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
        const parts = dateString.split('-'); // YYYY-MM-DD
        if (parts.length !== 3) return dateString; // Handle potential invalid format
        const day = parts[2];
        const monthIndex = parseInt(parts[1], 10) - 1;
        return `${day} ${months[monthIndex] || '???'}`;
    }

    // --- Helper: Get Status Abbreviation ---
     function getStatusAbbreviation(status) {
        switch (status) {
            case 'Hadir': return 'H';
            case 'Izin': return 'I';
            case 'Sakit': return 'S';
            case 'Alpa': return 'A';
            default: return '-';
        }
    }

    // --- Helper: Get Date String (YYYY-MM-DD) ---
    function getDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // --- Logic for Data Santri Page ---
    if (santriTable && filterTingkatanSelect) {
        let allSantriData = [];
        function renderSantriTable(dataToRender) {
            const tableBody = santriTable.querySelector('tbody');
            if (!tableBody) return;
            tableBody.innerHTML = '';
            if (dataToRender.length === 0) {
                 tableBody.innerHTML = '<tr><td colspan="4">Tidak ada data santri yang cocok.</td></tr>';
                 return;
            }
            dataToRender.forEach(santri => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${santri.id}</td>
                    <td>${santri.nama}</td>
                    <td>${santri.tingkatan}</td>
                    <td><button class="btn btn-sm btn-info detail-santri-btn" data-id="${santri.id}">Detail</button></td>
                `;
                tableBody.appendChild(row);
            });
        }
        function populateSantriFilter(data) {
            const tingkatanSet = new Set(data.map(s => s.tingkatan));
            const sortedTingkatan = Array.from(tingkatanSet).sort();
            sortedTingkatan.forEach(tingkatan => {
                filterTingkatanSelect.add(new Option(tingkatan, tingkatan));
            });
        }
        fetch('data_santri.json')
            .then(response => response.ok ? response.json() : Promise.reject('Network response was not ok'))
            .then(data => {
                allSantriData = data;
                populateSantriFilter(allSantriData);
                renderSantriTable(allSantriData);
                filterTingkatanSelect.addEventListener('change', (event) => {
                    const selected = event.target.value;
                    renderSantriTable(selected === "" ? allSantriData : allSantriData.filter(s => s.tingkatan === selected));
                });
            })
            .catch(error => {
                console.error('Error loading santri data:', error);
                const tableBody = santriTable.querySelector('tbody');
                if (tableBody) tableBody.innerHTML = '<tr><td colspan="4">Gagal memuat data santri.</td></tr>';
            });
    }
    // --- Logic for Data Tingkatan Page ---
    else if (tingkatanTable) {
         function renderTingkatanTable(tingkatanData) {
             const tableBody = tingkatanTable.querySelector('tbody');
             if (!tableBody) return;
             tableBody.innerHTML = '';
             if (Object.keys(tingkatanData).length === 0) {
                 tableBody.innerHTML = '<tr><td colspan="4">Tidak ada data tingkatan.</td></tr>';
                 return;
             }
             const sortedNames = Object.keys(tingkatanData).sort();
             let currentId = 1;
             sortedNames.forEach(name => {
                 const count = tingkatanData[name];
                 const row = document.createElement('tr');
                 row.innerHTML = `
                    <td>${currentId++}</td>
                    <td>${name}</td>
                    <td>${count}</td>
                    <td><button class="btn btn-sm btn-info detail-tingkatan-btn" data-tingkatan="${encodeURIComponent(name)}">Detail</button></td>
                 `;
                 row.querySelector('.detail-tingkatan-btn').addEventListener('click', (e) => {
                     const tingkatanParam = e.target.dataset.tingkatan;
                     window.location.href = `tingkatan_detail.html?tingkatan=${tingkatanParam}`;
                 });
                 tableBody.appendChild(row);
             });
        }
        fetch('data_santri.json')
            .then(response => response.ok ? response.json() : Promise.reject('Network response was not ok'))
            .then(data => {
                const counts = data.reduce((acc, santri) => {
                    acc[santri.tingkatan] = (acc[santri.tingkatan] || 0) + 1;
                    return acc;
                }, {});
                renderTingkatanTable(counts);
            })
            .catch(error => {
                console.error('Error loading data for tingkatan table:', error);
                const tableBody = tingkatanTable.querySelector('tbody');
                if (tableBody) tableBody.innerHTML = '<tr><td colspan="4">Gagal memuat data tingkatan.</td></tr>';
            });
    }
    // --- Logic for Tingkatan Detail Page ---
    else if (tingkatanDetailTable && tingkatanNameHeader && absensiTableContainer && filterJamSelect && filterTanggalSelect) {
        const urlParams = new URLSearchParams(window.location.search);
        const tingkatanParam = urlParams.get('tingkatan');

        // --- State Variables ---
        let decodedTingkatan = '';
        let relevantJamPelajaran = [];
        let santriInTingkatan = [];
        let absensiForTingkatan = []; // ALL absensi for this tingkatan

        if (!tingkatanParam) {
            // Handle missing parameter error
            tingkatanNameHeader.textContent = 'Detail Tingkatan: Nama Tingkatan Tidak Ditemukan';
            tingkatanDetailTable.querySelector('tbody').innerHTML = '<tr><td colspan="2">Parameter tingkatan tidak valid.</td></tr>';
            absensiTableContainer.innerHTML = '<p class="text-danger">Tidak bisa memuat absensi: parameter tingkatan tidak valid.</p>';
            return;
        }

        decodedTingkatan = decodeURIComponent(tingkatanParam);
        tingkatanNameHeader.textContent = `Detail Tingkatan: ${decodedTingkatan}`;
        relevantJamPelajaran = getJamPelajaran(decodedTingkatan);

        // --- Populate Jam Filter ---
        function populateJamFilter(jamList) {
            filterJamSelect.innerHTML = '<option value="semua">Semua Jam</option>'; // Reset
            jamList.forEach(jam => {
                filterJamSelect.add(new Option(jam, jam));
            });
        }

        // --- Filter and Render Attendance ---
        function filterAndRenderAbsensi() {
            const selectedJam = filterJamSelect.value;
            const selectedDateRange = filterTanggalSelect.value;

            // 1. Filter Absensi Data by Date Range
            const today = new Date();
            const todayStr = getDateString(today);
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const yesterdayStr = getDateString(yesterday);

            let filteredAbsensi = absensiForTingkatan; // Start with all absensi for the tingkatan

            if (selectedDateRange === 'hari_ini') {
                filteredAbsensi = absensiForTingkatan.filter(a => a.tanggal === todayStr);
            } else if (selectedDateRange === 'kemarin') {
                filteredAbsensi = absensiForTingkatan.filter(a => a.tanggal === yesterdayStr);
            } else if (selectedDateRange === 'minggu_ini') {
                const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
                const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday start
                const startOfWeek = new Date(today.setDate(diff));
                const startOfWeekStr = getDateString(startOfWeek);
                // Reset date to today for comparison
                today.setDate(today.getDate() + dayOfWeek - (dayOfWeek === 0 ? -6 : 1));

                filteredAbsensi = absensiForTingkatan.filter(a => a.tanggal >= startOfWeekStr && a.tanggal <= todayStr);
            } else if (selectedDateRange === 'bulan_ini') {
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                const startOfMonthStr = getDateString(startOfMonth);
                filteredAbsensi = absensiForTingkatan.filter(a => a.tanggal >= startOfMonthStr && a.tanggal <= todayStr);
            }
            // 'semua' range uses all absensiForTingkatan

            // 2. Filter Absensi Data by Jam (if not 'semua')
            if (selectedJam !== 'semua') {
                filteredAbsensi = filteredAbsensi.filter(a => a.jam_pelajaran === selectedJam);
            }

            // 3. Determine Unique Dates from Filtered Data
            const uniqueDates = [...new Set(filteredAbsensi.map(a => a.tanggal))]
                                .sort((a, b) => a.localeCompare(b)); // Sort ascending

            // 4. Determine Jam Pelajaran List for Header (might be filtered)
            const displayJamList = selectedJam === 'semua' ? relevantJamPelajaran : [selectedJam];

            // 5. Build Attendance Map from Filtered Data
            const attendanceMap = new Map();
            santriInTingkatan.forEach(s => attendanceMap.set(s.id, new Map()));
            filteredAbsensi.forEach(a => {
                if (!attendanceMap.get(a.santri_id).has(a.tanggal)) {
                    attendanceMap.get(a.santri_id).set(a.tanggal, new Map());
                }
                attendanceMap.get(a.santri_id).get(a.tanggal).set(a.jam_pelajaran, a.status);
            });

            // 6. Render the table
            renderAbsensiTable(santriInTingkatan, uniqueDates, displayJamList, attendanceMap);
        }


        // --- Initial Data Load ---
        Promise.all([
            fetch('data_santri.json').then(res => res.ok ? res.json() : Promise.reject('Failed to load santri data')),
            fetch('data_absensi.json').then(res => res.ok ? res.json() : Promise.reject('Failed to load absensi data'))
        ])
        .then(([allSantri, allAbsensi]) => {
            // Store data in higher scope
            santriInTingkatan = allSantri.filter(s => s.tingkatan === decodedTingkatan);
            const santriIdsInTingkatan = new Set(santriInTingkatan.map(s => s.id));
            absensiForTingkatan = allAbsensi.filter(a =>
                a.tingkatan === decodedTingkatan && santriIdsInTingkatan.has(a.santri_id)
            );

            // Initial setup
            renderSantriDetailTable(santriInTingkatan);
            populateJamFilter(relevantJamPelajaran);
            filterAndRenderAbsensi(); // Initial render with default filters

            // Add event listeners for filters
            filterJamSelect.addEventListener('change', filterAndRenderAbsensi);
            filterTanggalSelect.addEventListener('change', filterAndRenderAbsensi);

        })
        .catch(error => {
            console.error('Error loading data for detail page:', error);
            tingkatanDetailTable.querySelector('tbody').innerHTML = '<tr><td colspan="2">Gagal memuat data santri.</td></tr>';
            absensiTableContainer.innerHTML = `<p class="text-danger">Gagal memuat data absensi: ${error}</p>`;
        });

        // --- Render Santri List Table (Top) ---
        function renderSantriDetailTable(santriList) {
            const tableBody = tingkatanDetailTable.querySelector('tbody');
            if (!tableBody) return;
            tableBody.innerHTML = '';
            if (santriList.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="2">Tidak ada santri di tingkatan ${decodedTingkatan}.</td></tr>`;
                return;
            }
            santriList.forEach(santri => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${santri.id}</td><td>${santri.nama}</td>`;
                tableBody.appendChild(row);
            });
        }

        // --- Render Absensi Table (Bottom) ---
        function renderAbsensiTable(santriList, dates, jamPelajaranList, attendanceMap) {
            const table = document.getElementById('absensi-table');
            if (!table) return;
            const thead = table.querySelector('thead');
            const tbody = table.querySelector('tbody');
            thead.innerHTML = '';
            tbody.innerHTML = '';

            if (dates.length === 0) {
                 tbody.innerHTML = `<tr><td colspan="1">Tidak ada data absensi untuk filter yang dipilih.</td></tr>`;
                 return;
            }

            // Build Header Row
            const headerRow = document.createElement('tr');
            const thSantri = document.createElement('th');
            thSantri.textContent = 'Nama Santri';
            thSantri.rowSpan = jamPelajaranList.length > 1 ? 2 : 1; // Adjust rowspan based on displayed jams
            thSantri.style.verticalAlign = 'middle';
            headerRow.appendChild(thSantri);

            const subHeaderRow = document.createElement('tr'); // For jam pelajaran

            dates.forEach(date => {
                const thDate = document.createElement('th');
                thDate.textContent = formatDate(date);
                thDate.colSpan = jamPelajaranList.length;
                thDate.style.textAlign = 'center';
                headerRow.appendChild(thDate);

                jamPelajaranList.forEach(jam => {
                    const thJam = document.createElement('th');
                    thJam.textContent = jam.replace('Malam Jam ', 'M');
                    thJam.style.textAlign = 'center';
                    subHeaderRow.appendChild(thJam);
                });
            });
            thead.appendChild(headerRow);
            if (jamPelajaranList.length > 1) {
                 thead.appendChild(subHeaderRow);
            }

            // Build Body Rows
            if (santriList.length === 0) {
                 tbody.innerHTML = `<tr><td colspan="${1 + dates.length * jamPelajaranList.length}">Tidak ada santri untuk ditampilkan absensinya.</td></tr>`;
                 return;
            }

            santriList.sort((a,b) => a.nama.localeCompare(b.nama)).forEach(santri => {
                const row = document.createElement('tr');
                const tdNama = document.createElement('td');
                tdNama.textContent = santri.nama;
                row.appendChild(tdNama);

                dates.forEach(date => {
                    const dateMap = attendanceMap.get(santri.id)?.get(date);
                    jamPelajaranList.forEach(jam => {
                        const status = dateMap?.get(jam);
                        const tdStatus = document.createElement('td');
                        tdStatus.textContent = getStatusAbbreviation(status);
                        tdStatus.style.textAlign = 'center';
                        if (status === 'Alpa') tdStatus.classList.add('text-danger', 'fw-bold');
                        if (status === 'Izin') tdStatus.classList.add('text-warning');
                        if (status === 'Sakit') tdStatus.classList.add('text-info');
                        row.appendChild(tdStatus);
                    });
                });
                tbody.appendChild(row);
            });
        }
    }
});