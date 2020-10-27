const { MongoClient } = require('mongodb')
// import * as uuid from 'uuid'
const fetch = require('node-fetch')
const Places = require('./places.json')

// import {
// 	MONGO_URL,
// } from './environments'
let MONGO_URL = 'mongodb://localhost/demo-nhathuoc'
async function updateDistrict() {
    console.log('🚀  Server ready')
    const client = new MongoClient(MONGO_URL)
    function removeVietnameseTones(str) {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/gi, "a")
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/gi, "e")
        str = str.replace(/ì|í|ị|ỉ|ĩ/gi, "i")
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/gi, "o")
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/gi, "u")
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/gi, "y")
        str = str.replace(/đ/gi, "d")
        // Some system encode vietnamese combining accent as individual utf-8 characters
        // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "") // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
        str = str.replace(/\u02C6|\u0306|\u031B/g, "") // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
        // Remove extra spaces
        // Bỏ các khoảng trắng liền nhau
        str = str.replace(/ + /g, " ")
        str = str.trim()
        // Remove punctuations
        // Bỏ dấu câu, kí tự đặc biệt
        str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ")
        return str
    }

    try {
        await client.connect()
        console.log('🌱  Database seeder is running')
        const db = client.db('dbseed')

        let codeProvinces = {
            'Thành phố Hà Nội': '01', 'Tỉnh Hà Giang': '02', 'Tỉnh Cao Bằng': '04', 'Tỉnh Bắc Kạn': '06',
            'Tỉnh Tuyên Quang': '08', 'Tỉnh Lào Cai': '10', 'Tỉnh Điện Biên': '11', 'Tỉnh Lai Châu': '12',
            'Tỉnh Sơn La': '14', 'Tỉnh Yên Bái': '15', 'Tỉnh Hoà Bình': '17', 'Tỉnh Thái Nguyên': '19',
            'Tỉnh Lạng Sơn': '20', 'Tỉnh Quảng Ninh': '22', 'Tỉnh Bắc Giang': '24', 'Tỉnh Phú Thọ': '25',
            'Tỉnh Vĩnh Phúc': '26', 'Tỉnh Bắc Ninh': '27', 'Tỉnh Hải Dương': '30', 'Thành phố Hải Phòng': '31',
            'Tỉnh Hưng Yên': '33', 'Tỉnh Thái Bình': '34', 'Tỉnh Hà Nam': '35', 'Tỉnh Nam Định': '36',
            'Tỉnh Ninh Bình': '37', 'Tỉnh Thanh Hóa': '38', 'Tỉnh Nghệ An': '40', 'Tỉnh Hà Tĩnh': '42',
            'Tỉnh Quảng Bình': '44', 'Tỉnh Quảng Trị': '45', 'Tỉnh Thừa Thiên Huế': '46', 'Thành phố Đà Nẵng': '48',
            'Tỉnh Quảng Nam': '49', 'Tỉnh Quảng Ngãi': '51', 'Tỉnh Bình Định': '52', 'Tỉnh Phú Yên': '54',
            'Tỉnh Khánh Hòa': '56', 'Tỉnh Ninh Thuận': '58', 'Tỉnh Bình Thuận': '60', 'Tỉnh Kon Tum': '62',
            'Tỉnh Gia Lai': '64', 'Tỉnh Đắk Lắk': '66', 'Tỉnh Đắk Nông': '67', 'Tỉnh Lâm Đồng': '68',
            'Tỉnh Bình Phước': '70', 'Tỉnh Tây Ninh': '72', 'Tỉnh Bình Dương': '74', 'Tỉnh Đồng Nai': '75',
            'Tỉnh Bà Rịa - Vũng Tàu': '77', 'Thành phố Hồ Chí Minh': '79', 'Tỉnh Long An': '80', 'Tỉnh Tiền Giang': '82',
            'Tỉnh Bến Tre': '83', 'Tỉnh Trà Vinh': '84', 'Tỉnh Vĩnh Long': '86', 'Tỉnh Đồng Tháp': '87',
            'Tỉnh An Giang': '89', 'Tỉnh Kiên Giang': '91', 'Thành phố Cần Thơ': '92', 'Tỉnh Hậu Giang': '93',
            'Tỉnh Sóc Trăng': '94', 'Tỉnh Bạc Liêu': '95', 'Tỉnh Cà Mau': '96'
        }

        let provinces = []

        provinces = Object.keys(codeProvinces).map(nameP => {
            const mediProvinceCode = codeProvinces[nameP]
            return { code: codeProvinces[nameP], name: nameP }
        })
        for (nameP in codeProvinces) {
            console.log(codeProvinces[nameP])
            await db.collection('places').findOneAndUpdate(
                { code: codeProvinces[nameP] },
                {
                    $set: {
                        code: codeProvinces[nameP],
                        type: 'PROVINCE',
                        codeFull: '00000-000HH-' + codeProvinces[nameP],
                        codeParent: '0',
                        name: nameP,
                        fullName: nameP,
                        acronym: nameP.split(' ').map(p => p[0]).join(''),
                        unsignedName: nameP,
                        isActive: true,
                        createdAt: +new Date(),
                        createdBy: {
                            _id: '0',
                            username: 'admin',
                            fullName: 'Administrator'
                        }
                    }
                },
                { upsert: true }
            )
            let getHuyen = await fetch("https://baohiemxahoi.gov.vn/UserControls/BHXH/BaoHiemYTe/HienThiHoGiaDinh/AjaxPost.aspx/GetHuyenByLstmatinh", {
                "headers": {
                    "accept": "application/json, text/javascript, */*; q=0.01",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/json; charset=UTF-8",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-requested-with": "XMLHttpRequest"
                },
                "referrer": "https://baohiemxahoi.gov.vn/tracuu/Pages/diem-thu-dai-ly.aspx",
                "referrerPolicy": "no-referrer-when-downgrade",
                "body": `{lstmatinh:\"${codeProvinces[nameP]}TTT\"} `,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            })
            let getHuyen1 = await getHuyen.json()
            let getHuyen2 = getHuyen1.d ? JSON.parse(getHuyen1.d) : undefined
            if (getHuyen2.length) {
                for (h = 0; h < getHuyen2.length; h++) {
                    getHuyen2[h].TenHuyen
                    if (getHuyen2[h].TenHuyen.split(' ')[0] !== 'Huyện'
                        && getHuyen2[h].TenHuyen.split(' ')[0] !== 'Quận'
                        && getHuyen2[h].TenHuyen.split(' ')[0] !== 'Thành'
                        && getHuyen2[h].TenHuyen.split(' ')[0] !== 'Thị'
                    ) {
                        console.log(getHuyen2[h].TenHuyen);
                    }
                    await db.collection('places').findOneAndUpdate(
                        { code: getHuyen2[h].MaHuyen },
                        {
                            $set: {
                                code: getHuyen2[h].MaHuyen,
                                codeFull: '00000-' + getHuyen2[h].MaHuyen + '-' + codeProvinces[nameP],
                                type: 'DISTRICT',
                                codeParent: codeProvinces[nameP],
                                name: getHuyen2[h].TenHuyen,
                                fullName: getHuyen2[h].TenHuyen + ', ' + nameP,
                                acronym:
                                    (removeVietnameseTones(getHuyen2[h].TenHuyen + ' ' + nameP)
                                        .split(' ').map(p => p[0]).join('') + '--'
                                        + removeVietnameseTones(getHuyen2[h].TenHuyen.replace(/^(Huyện|Thành phố|Thị xã|Quận)/i, '') + ' ' + nameP.replace(/^(Tỉnh|Thành phố)/i, ''))
                                            .split(' ').map(p => p[0]).join('')).toLocaleLowerCase(),
                                unsignedName: (removeVietnameseTones(getHuyen2[h].TenHuyen + ' ' + nameP)
                                    + '--'
                                    + removeVietnameseTones(getHuyen2[h].TenHuyen
                                        .replace(/^(Huyện|Thành phố|Thị xã|Quận)/i, '') + ' ' + nameP
                                            .replace(/^(Tỉnh|Thành phố)/i, ''))
                                ).toLocaleLowerCase(),
                                isActive: true,
                                createdAt: +new Date(),
                                createdBy: {
                                    _id: '0',
                                    username: 'admin',
                                    fullName: 'Administrator'
                                }
                            }
                        },
                        { upsert: true }
                    )
                }
            }

        }
        let districts = await db.collection('places').find({ type: 'DISTRICT' }).toArray()
        console.log('Start update Ward')

        for (let i = 0; i < districts.length; i++) {
            try {
                console.log(i)
                let xa1 = await fetch("https://baohiemxahoi.gov.vn/UserControls/BHXH/BaoHiemYTe/HienThiHoGiaDinh/AjaxPost.aspx/GetPhuongBylstmahuyen", {
                    "headers": {
                        "accept": "application/json, text/javascript, */*; q=0.01",
                        "accept-language": "en-US,en;q=0.9",
                        "content-type": "application/json; charset=UTF-8",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-requested-with": "XMLHttpRequest"
                    },
                    "referrer": "https://baohiemxahoi.gov.vn/tracuu/Pages/diem-thu-dai-ly.aspx",
                    "referrerPolicy": "no-referrer-when-downgrade",
                    "body": `{lstmahuyen:\"${districts[i].code}\"} `,
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                })
                let xa2 = await xa1.json()
                let xa3 = xa2.d ? JSON.parse(xa2.d) : undefined
                if (xa3.length) {
                    for (x = 0; x < xa3.length; x++) {
                        await db.collection('places').findOneAndUpdate(
                            { code: xa3[x].MaXa },
                            {
                                $set: {
                                    code: xa3[x].MaXa,
                                    codeFull: districts[i].codeFull.replace('00000', xa3[x].MaXa),
                                    type: 'WARD',
                                    codeParent: districts[i].code,
                                    name: xa3[x].TenXa,
                                    fullName: xa3[x].TenXa + ', ' + districts[i].fullName,
                                    acronym: removeVietnameseTones(
                                        xa3[x].TenXa.split(' ').map(p => p[0]).join('')).toLocaleLowerCase() + districts[i].acronym.split('--')[0]
                                        + '--' + removeVietnameseTones(xa3[x].TenXa.split(' ').map(p => p[0]).join('')).toLocaleLowerCase()
                                        + districts[i].acronym.split('--')[1]
                                    ,
                                    unsignedName: removeVietnameseTones(xa3[x].TenXa).toLocaleLowerCase() + ' ' + districts[i].unsignedName.split('--')[0]
                                        + '--' + removeVietnameseTones(xa3[x].TenXa).toLocaleLowerCase() + ' ' + districts[i].unsignedName.split('--')[1],
                                    isActive: true,
                                    createdAt: +new Date(),
                                    createdBy: {
                                        _id: '0',
                                        username: 'admin',
                                        fullName: 'Administrator'
                                    }
                                }
                            },
                            { upsert: true }
                        )
                    }
                }
            } catch (error) {
                console.log(`err on : ${districts[i].code}`)
            }
        }
        client.close()
        console.log('object')
    } catch (err) {
        console.log('❌  Server error', err.stack)
    }
}
updateDistrict()
