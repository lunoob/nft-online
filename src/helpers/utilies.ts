/**
 * @Author: luoob
 * @Date: 2021-11-21 21:13:02
 * @Last Modified by: luoob
 * @Last Modified time: 2021-11-21 21:13:05
 * @Introduction: 工具函数模块
 */

/**
 * 将 base64 转换为 blob
 * @date 2021-07-28
 * @param {string} dataurl
 * @returns {any}
 */
export function base64ToBlob(dataUrl: string) {
	let arr = dataUrl.split(',')
	let mime = arr[0].match(/:(.*?);/)![1]
	let bstr = atob(arr[1])
	let n = bstr.length
	let u8arr = new Uint8Array(n)
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n)
	}
	return new Blob([u8arr], { type: mime })
}

/**
 * 根据 blob 数据格式下载文件
 * @date 2021-08-18
 * @param {string | Blob} blob
 * @param {string} fileName
 * @returns {any}
 */
export function downloadFile(blob: Blob, fileName: string) {
	const downloadUrl = window.URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.download = fileName
	link.href = downloadUrl
	link.click()
}
