import Head from "next/head";
import { useRouter } from "next/router";

export default function SelectionPage() {
  const router = useRouter();

  // [+] 提取公共类名，确保 Tailwind 能够生效
  // border-2 增加视觉存在感，hover: 状态激活
  const cardClassName = "flex w-[500px] flex-col items-center gap-[16px] rounded-[16px] border-2 border-transparent hover:border-[#4880FF] hover:bg-[#F0F5FF] transition-all duration-300 cursor-pointer group active:scale-[0.98]";

  return (
    // [*] 保持 pt-[60px] 实现页面上移
    <div className="min-h-screen bg-white flex flex-col items-center justify-start pt-[60px] p-4">
      <Head>
        <title>Trackahabit | Selection</title>
      </Head>

      <div className="w-full max-w-[1060px] flex flex-col gap-[32px]">
        {/* [1] 标题样式 */}
        <h1 
          style={{
            color: '#202224',
            fontFamily: '"SF Pro", -apple-system, sans-serif',
            fontSize: '32px',
            fontWeight: 590,
            fontStyle: 'normal',
            lineHeight: 'normal',
            alignSelf: 'flex-start'
          }}
        >
          Welcome to Trackahabit
        </h1>

        {/* [2] 内框样式 */}
        <div 
          style={{
            display: 'flex',
            padding: '32px 50px',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '32px',
            alignSelf: 'stretch',
            border: '1px solid #BFBFBF',
            borderRadius: '8px'
          }}
        >
          {/* [3] 内框内文本样式 - 强制单行且向左对齐 */}
          <p 
            style={{
              color: '#000',
              fontFamily: '"SF Pro", sans-serif',
              fontSize: '20px',
              fontWeight: 400,
              fontStyle: 'normal',
              lineHeight: 'normal',
              textAlign: 'left',
              whiteSpace: 'nowrap' 
            }}
          >
            Pick a module to get started!
          </p>

          {/* 模块选择区域 */}
          <div className="flex w-full justify-between gap-[20px]">
            
            {/* [4-5] 我的课程模块 - 修复高亮功能 */}
            <div
              onClick={() => router.push("/home")}
              className={`${cardClassName} bg-[#F8FAFF]`}
              style={{ padding: '14px 0 30px 0' }}
            >
              <div className="w-[140px] h-[140px] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70" fill="none">
                  <path d="M35.0003 24.7918L41.172 39.6304L57.1915 40.9149L44.9864 51.37L48.715 67.0021L35.0003 58.6252L21.2852 67.0021L25.0141 51.37L12.8088 40.9149L28.8284 39.6304L35.0003 24.7918ZM35.0003 39.9789L32.846 45.1604L27.2564 45.6081L31.5149 49.2577L30.2111 54.7139L35.0003 51.7897L39.7865 54.7139L38.4854 49.2577L42.7411 45.6081L37.1543 45.1604L35.0003 39.9789ZM23.3335 5.8335V32.0835H17.5002V5.8335H23.3335ZM52.5003 5.8335V32.0835H46.667V5.8335H52.5003ZM37.917 5.8335V20.4168H32.0836V5.8335H37.917Z" fill="#4880FF"/>
                </svg>
              </div>
              <span style={{
                color: '#4880FF',
                textAlign: 'center',
                fontFamily: '"SF Pro", sans-serif',
                fontSize: '18px',
                fontWeight: 400
              }}>
                My Courses
              </span>
            </div>

            {/* [6-7] 我的支出模块 - 修复高亮功能 */}
            <div
                onClick={() => router.push("/myExpenses")} // [+] 对接跳转逻辑
                className={`${cardClassName} bg-[#F8FAFF]`}
                style={{ padding: '14px 0 30px 0' }}
                >
              <div className="w-[140px] h-[140px] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70" fill="none">
                  <path d="M8.7642 8.74951H61.2643C62.8751 8.74951 64.1809 10.0553 64.1809 11.6662V58.3329C64.1809 59.9437 62.8751 61.2495 61.2643 61.2495H8.7642C7.15338 61.2495 5.84753 59.9437 5.84753 58.3329V11.6662C5.84753 10.0553 7.15338 8.74951 8.7642 8.74951ZM58.3476 32.0829H11.6809V55.4162H58.3476V32.0829ZM58.3476 26.2495V14.5828H11.6809V26.2495H58.3476ZM40.8476 43.7495H52.5143V49.5829H40.8476V43.7495Z" fill="#4880FF"/>
                </svg>
              </div>
              <span style={{
                color: '#4880FF',
                textAlign: 'center',
                fontFamily: '"SF Pro", sans-serif',
                fontSize: '18px',
                fontWeight: 400
              }}>
                My Expenses
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}