/**
 * @Author: luoob
 * @Date: 2022-01-13 10:12:35
 * @Last Modified by: luoob
 * @Last Modified time: 2022-01-13 10:12:37
 * @Introduction: 过滤 vercel build 过程
 */

// 获取提交部署的分支名
const branch = process.env.VERCEL_GIT_COMMIT_REF

/**
 * 执行退出命令
 * @date 2022-01-13
 * @param {number} code
 * @returns {any}
 */
function exit(code) {
    process.emit('exit')
    process.exitCode = code
}

if (branch === 'main') {
    console.log('✅ - Build can proceed')
    exit(1)
} else {
    console.log('🛑 - Build cancelled')
    exit(0)
}
// echo $? 获取上一次脚本的退出码
