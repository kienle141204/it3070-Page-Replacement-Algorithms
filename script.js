// chay thuat toan dua tren dau vao cua nguoi dung va hien thi ket qua
function runAlgorithm() {
    const algorithm = document.getElementById('algorithm').value;
    const pages = document.getElementById('pages').value.split(',').map(Number);
    const frames = parseInt(document.getElementById('frames').value);

    if (!pages || !frames) {
        alert('Hay nhap du lieu vao!!!');
        return;
    }

    let result;
    switch (algorithm) {
        case 'fifo':
            result = fifo(pages, frames);
            break;
        case 'lru':
            result = lru(pages, frames);
            break;
        case 'optimal':
            result = optimal(pages, frames);
            break;
        case 'lfu':
            result = lfu(pages, frames);
            break;
        case 'mfu':
            result = mfu(pages, frames);
            break;
        case 'nru':
            result = nru(pages, frames);
            break;
        case 'clock':
            result = clock(pages, frames);
            break;
        default:
            break;
    }

    document.getElementById('result').innerHTML = formatResult(result, frames);
}

// thuat toan FIFO (First In First Out)
function fifo(pages, frames) {
    let pageFrames = [];
    let pageFaults = 0; 
    let steps = []; // luu tru cac buoc thuc hien
    let index= 0; // chi so de thay the trang 

    pages.forEach(page => {
        let step = { page, frames: [...pageFrames], fault: false };

        // kiem tra trang hien tai co trong khung trang khong
        if (!pageFrames.includes(page)) {
            // thay the trang tai vi tri index
            pageFrames[index] = page;
            index = (index + 1) % frames; // di chuyen den vi tri tiep theo 
            pageFaults++; // tang so loi trang
            step.fault = true; // danh dau buoc nay la loi trang
        }

        step.frames = [...pageFrames];
        steps.push(step);
    });

    return { pageFaults, steps };
}

// thuat toan LRU (Least Recently Used)
function lru(pages, frames) {
    let pageFrames = []; 
    let pageFaults = 0; 
    let steps = []; // luu tru cac buoc thuc hien
    let recent = []; // danh sach cac trang duoc truy cap gan day

    pages.forEach(page => { // lap qua tung trang
        let step = { page, frames: [...pageFrames], fault: false };

        if (!pageFrames.includes(page)) {
            // thay the trang it duoc su dung gan day nhat
            if (pageFrames.length < frames) {
                pageFrames.push(page);
            } else {
                const lruPage = recent.shift(); // lay trang it duoc su dung gan day nhat tu dau danh sach recent
                const indexToRemove = pageFrames.indexOf(lruPage); // tim chi so cua trang nay trong khung trang
                pageFrames[indexToRemove] = page; // thay the trang it duoc su dung gan day nhat bang trang moi
            }
            recent.push(page);
            pageFaults++; // tang so loi trang
            step.fault = true; // danh dau loi trang cho buoc nay
        } else {
            // neu trang da co trong khung trang, cap nhat lai vi tri cua no trong danh sach recent
            recent = recent.filter(p => p !== page); // xoa trang hien tai khoi danh sach recent neu co
            recent.push(page); // them trang hien tai vao cuoi danh sach recent
        }

        step.frames = [...pageFrames];
        steps.push(step);
    });

    return { pageFaults, steps };
}

// thuat toan optimal
function optimal(pages, frames) {
    let pageFrames = []; 
    let pageFaults = 0; 
    let steps = []; // luu tru cac buoc thuc hien

    pages.forEach((page, index) => {
        let step = { page, frames: [...pageFrames], fault: false };

        // kiem tra trang hien tai co trong khung trang khong
        if (!pageFrames.includes(page)) {
            // neu khung trang day, tim trang se khong duoc su dung lau nhat trong tuong lai
            if (pageFrames.length >= frames) {
                const futureUses = pageFrames.map(pf => pages.slice(index + 1).indexOf(pf));
                const replaceIndex = futureUses.indexOf(-1) !== -1
                    ? futureUses.indexOf(-1)
                    : futureUses.indexOf(Math.max(...futureUses));
                pageFrames[replaceIndex] = page;
            } else {
                pageFrames.push(page); // them trang moi vao khung trang neu chua day
            }
            pageFaults++; // tang so loi trang
            step.fault = true; // danh dau loi trang cho buoc nay
        }

        step.frames = [...pageFrames];
        steps.push(step);
    });

    return { pageFaults, steps };
}

// thuat toan LFU (Least Frequently Used)
function lfu(pages, frames) {
    let pageFrames = []; 
    let pageFrequency = new Map(); // map tan suat xuat hien cua cac trang
    let pageFaults = 0; 
    let steps = []; 
    let recent = []; // mang luu tru thu tu cac trang duoc nap vao

    pages.forEach((page, index) => {
        let step = { page, frames: [...pageFrames], fault: false };

        // them trang vao mang recent
        recent.push(page);

        if (pageFrequency.has(page)) {
            // tang tan suat neu trang da co trong bo nho
            pageFrequency.set(page, pageFrequency.get(page) + 1);
        } else {
            // xu ly loi trang
            if (pageFrames.length >= frames) {
                // neu khung trang day, tim trang co tan suat thap nhat de thay the
                let lfuPage = null;
                let minFreq = Infinity;

                pageFrames.forEach(pf => {
                    if (pageFrequency.get(pf) < minFreq) {
                        minFreq = pageFrequency.get(pf);
                        lfuPage = pf;
                    } else if (pageFrequency.get(pf) === minFreq) {
                        if (recent.indexOf(pf) < recent.indexOf(lfuPage)) {
                            lfuPage = pf;
                        }
                    }
                });

                // xoa trang LFU va them trang moi
                pageFrames[pageFrames.indexOf(lfuPage)] = page;
                pageFrequency.delete(lfuPage);

                recent.splice(recent.indexOf(lfuPage), 1);
            } else {
                // them trang moi vao khung trang neu chua day
                pageFrames.push(page);
            }
            // dat tan suat ban dau cho trang moi
            pageFrequency.set(page, 1);
            pageFaults++; // tang so loi trang
            step.fault = true; // danh dau loi trang cho buoc nay
        }

        step.frames = [...pageFrames];
        steps.push(step);
    });

    return { pageFaults, steps };
}

// thuat toan MFU (Most Frequently Used)
function mfu(pages, frames) {
    let pageFrames = []; 
    let pageFrequency = new Map(); // map tan suat xuat hien cua cac trang
    let pageFaults = 0; 
    let steps = []; // luu tru cac buoc thuc hien
    let recent = []; // mang luu tru thu tu cac trang duoc nap vao

    pages.forEach((page, index) => {
        let step = { page, frames: [...pageFrames], fault: false };

        // them trang vao mang recent
        recent.push(page);

        if (pageFrequency.has(page)) {
            // tang tan suat neu trang da co trong bo nho
            pageFrequency.set(page, pageFrequency.get(page) + 1);
        } else {
            // xu ly loi trang
            if (pageFrames.length >= frames) {
                // neu khung trang day, tim trang co tan suat cao nhat de thay the
                let mfuPage = null;
                let maxFreq = -Infinity;

                pageFrames.forEach(pf => {
                    if (pageFrequency.get(pf) > maxFreq) {
                        maxFreq = pageFrequency.get(pf);
                        mfuPage = pf;
                    } else if (pageFrequency.get(pf) === maxFreq) {
                        // neu tan suat bang nhau, chon trang xuat hien truoc
                        if (recent.indexOf(pf) < recent.indexOf(mfuPage)) {
                            mfuPage = pf;
                        }
                    }
                });

                // xoa trang MFU va them trang moi
                pageFrames[pageFrames.indexOf(mfuPage)] = page;
                pageFrequency.delete(mfuPage);

                recent.splice(recent.indexOf(mfuPage), 1);
            } else {
                // them trang moi vao khung trang neu chua day
                pageFrames.push(page);
            }
            // dat tan suat ban dau cho trang moi
            pageFrequency.set(page, 1);
            pageFaults++; // tang so loi trang
            step.fault = true; // danh dau loi trang cho buoc nay
        }

        step.frames = [...pageFrames];
        steps.push(step);
    });

    return { pageFaults, steps };
}

// thuat toan NRU (Not Recently Used)
function nru(pages, frames) {
    let pageFrames = []; 
    let referenceBits = []; 
    let modifiedBits = []; // Danh sách bit sửa đổi
    let pageFaults = 0; // Số lỗi trang
    let steps = []; // Lưu trữ các bước thực hiện

    // Đặt lại bit tham chiếu định kỳ (ví dụ: sau mỗi 5 lần tham chiếu)
    const resetInterval = frames;
    const resetReferenceBits = () => {
        referenceBits = referenceBits.map(() => 0);
    };
 
    pages.forEach((page, index) => {
        let step = { page, frames: [...pageFrames], fault: false };

        // Kiểm tra trang hiện tại có trong khung trang không
        if (!pageFrames.includes(page)) {
            // Nếu khung trang đầy, tìm trang không được tham chiếu gần đây nhất
            if (pageFrames.length >= frames) {
                let replaceIndex = -1;

                // Chọn trang để thay thế theo thứ tự ưu tiên của NRU
                for (let i = 0; i < pageFrames.length; i++) {
                    if (referenceBits[i] === 0 && modifiedBits[i] === 0) {
                        replaceIndex = i;
                        break;
                    }
                }
                if (replaceIndex === -1) {
                    for (let i = 0; i < pageFrames.length; i++) {
                        if (referenceBits[i] === 0 && modifiedBits[i] === 1) {
                            replaceIndex = i;
                            break;
                        }
                    }
                }
                if (replaceIndex === -1) {
                    for (let i = 0; i < pageFrames.length; i++) {
                        if (referenceBits[i] === 1 && modifiedBits[i] === 0) {
                            replaceIndex = i;
                            break;
                        }
                    }
                }
                if (replaceIndex === -1) {
                    for (let i = 0; i < pageFrames.length; i++) {
                        if (referenceBits[i] === 1 && modifiedBits[i] === 1) {
                            replaceIndex = i;
                            break;
                        }
                    }
                }
                if (replaceIndex === -1) {
                    replaceIndex = 0; // Mặc định chọn trang đầu tiên nếu không tìm thấy
                }

                // Thay thế trang tại replaceIndex
                pageFrames[replaceIndex] = page;
                referenceBits[replaceIndex] = 1; // Đặt bit tham chiếu của trang mới là 1
                modifiedBits[replaceIndex] = 0; // Giả sử trang mới chưa được sửa đổi
            } else {
                pageFrames.push(page); // Thêm trang mới vào khung trang
                referenceBits.push(1); // Thêm bit tham chiếu của trang mới là 1
                modifiedBits.push(0); // Giả sử trang mới chưa được sửa đổi
            }
            pageFaults++; // Tăng số lỗi trang
            step.fault = true; // Đánh dấu lỗi trang cho bước này
        } else {
            // Nếu trang đã có trong khung trang, đặt bit tham chiếu của nó là 1
            const pageIndex = pageFrames.indexOf(page);
            referenceBits[pageIndex] = 1;
        }

        // Đặt lại bit tham chiếu định kỳ
        if ((index + 1) % resetInterval === 0) {
            resetReferenceBits();
        }

        step.frames = [...pageFrames];
        steps.push(step);
    });

    return { pageFaults, steps };
}

// Thuật toán Clock // chưa 
function clock(pages, frames) {
    let pageFrames = []; 
    let referenceBits = []; 
    let pointer = 0; // Con trỏ chỉ vào vị trí hiện tại trong khung trang
    let pageFaults = 0; // Số lỗi trang
    let steps = []; // Lưu trữ các bước thực hiện

    pages.forEach(page => {
        let step = { page, frames: [...pageFrames], fault: false };

        // Kiểm tra trang hiện tại có trong khung trang không
        if (!pageFrames.includes(page)) {
            // Nếu khung trang đầy, tìm trang có bit tham chiếu là 0
            while (referenceBits[pointer] === 1) {
                referenceBits[pointer] = 0; // Đặt lại bit tham chiếu
                pointer = (pointer + 1) % frames; // Di chuyển con trỏ tới trang tiếp theo
            }
            // Thay thế trang tại vị trí con trỏ
            if (pageFrames.length >= frames) {
                pageFrames[pointer] = page;
                referenceBits[pointer] = 1; // Đặt bit tham chiếu của trang mới là 1
            } else {
                pageFrames.push(page);
                referenceBits.push(1);
            }
            pageFaults++; // Tăng số lỗi trang
            step.fault = true; // Đánh dấu lỗi trang cho bước này
            pointer = (pointer + 1) % frames; // Di chuyển con trỏ tới trang tiếp theo
        } else {
            // Nếu trang đã có trong khung trang, đặt bit tham chiếu của nó là 1
            const pageIndex = pageFrames.indexOf(page);
            referenceBits[pageIndex] = 1;
        }

        step.frames = [...pageFrames];
        steps.push(step);
    });

    return { pageFaults, steps };
}

// dinh dang ket qua hien thi
function formatResult(result, frames) {
    let resultHTML = '';
    if (result.steps.length <= 40 && frames <=5) { 
        resultHTML += `<p>Page Faults: ${result.pageFaults}</p>`;
        resultHTML += `<table><tr><th>Step</th>`;
        for (let i = 0; i < result.steps.length; i++) {
            resultHTML += `<th>${i + 1}</th>`;
        }
        resultHTML += `</tr><tr><td>Page</td>`;
        result.steps.forEach(step => {
            resultHTML += `<td>${step.page}</td>`;
        });
        // hiển thị các khung trang
        for (let i = 0; i < frames; i++) {
            resultHTML += `</tr><tr><td></td>`;//frame 
            result.steps.forEach(step => {
                resultHTML += `<td>${step.frames[i] !== undefined ? step.frames[i] : ''}</td>`;
            });
        }
        resultHTML += `</tr><tr><td>MissOrHit</td>`;
        // hiển thị lỗi trang
        result.steps.forEach(step => {
            resultHTML += `<td>${step.fault ? 'M' : 'H'}</td>`;
        });
        resultHTML += `</tr></table>`;
    } else {
        resultHTML += `<p>Page Faults: ${result.pageFaults}</p>`;
    }
    return resultHTML;
}
