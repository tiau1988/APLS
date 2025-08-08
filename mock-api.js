/**
 * 模拟API响应处理程序
 * 用于本地测试环境，拦截所有/api/请求并返回模拟响应
 */

(function() {
    // 存储已注册的用户（模拟数据库）
    const registrations = [];
    
    // 拦截所有fetch请求
    const originalFetch = window.fetch;
    
    window.fetch = async function(url, options) {
        // 只拦截API请求
        if (typeof url === 'string' && url.includes('/api/')) {
            console.log('拦截API请求:', url, options);
            
            // 添加延迟模拟网络请求
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 处理文件上传请求
            if (url.includes('/api/upload')) {
                return handleFileUpload(options);
            }
            
            // 处理注册请求
            if (url.includes('/api/register')) {
                return handleRegistration(options);
            }
            
            // 未知API端点
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    message: '未知API端点' 
                }),
                { 
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
        
        // 对于非API请求，使用原始fetch
        return originalFetch(url, options);
    };
    
    /**
     * 处理文件上传请求
     */
    function handleFileUpload(options) {
        try {
            const body = JSON.parse(options.body);
            
            // 验证必要字段
            if (!body.fileData || !body.fileName || !body.fileType) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        message: '缺少必要的文件信息'
                    }),
                    { 
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            }
            
            // 检查文件类型
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
            if (!validTypes.includes(body.fileType)) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        message: '不支持的文件类型。请上传图片或PDF。'
                    }),
                    { 
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            }
            
            // 生成唯一文件名
            const timestamp = new Date().getTime();
            const randomStr = Math.random().toString(36).substring(2, 8);
            const fileExt = body.fileName.split('.').pop();
            const uniqueFileName = `payment_slip_${timestamp}_${randomStr}.${fileExt}`;
            
            // 返回模拟响应
            return new Response(
                JSON.stringify({
                    success: true,
                    message: '文件上传成功',
                    file: {
                        url: `https://example.com/uploads/${uniqueFileName}`,
                        name: uniqueFileName,
                        size: body.fileData.length,
                        type: body.fileType
                    }
                }),
                { 
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        } catch (error) {
            console.error('处理文件上传时出错:', error);
            return new Response(
                JSON.stringify({
                    success: false,
                    message: '处理文件上传时出错: ' + error.message
                }),
                { 
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
    }
    
    /**
     * 处理注册请求
     */
    function handleRegistration(options) {
        try {
            const body = JSON.parse(options.body);
            console.log('注册数据:', body);
            
            // 验证必填字段
            const requiredFields = ['name', 'email', 'phone', 'affiliation', 'registrationType', 'paymentMethod'];
            const missingFields = requiredFields.filter(field => !body[field]);
            
            if (missingFields.length > 0) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        message: `缺少必填字段: ${missingFields.join(', ')}`
                    }),
                    { 
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            }
            
            // 检查邮箱是否已注册
            const existingRegistration = registrations.find(reg => reg.email === body.email);
            if (existingRegistration) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        message: `邮箱 ${body.email} 已经注册。`
                    }),
                    { 
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            }
            
            // 生成注册ID
            const timestamp = new Date().getTime();
            const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
            const registrationId = `REG-${timestamp.toString().slice(-6)}-${randomStr}`;
            
            // 创建注册记录
            const registration = {
                id: registrationId,
                name: body.name,
                email: body.email,
                phone: body.phone,
                affiliation: body.affiliation,
                position: body.position || '',
                registrationType: body.registrationType,
                dietaryRestrictions: body.dietaryRestrictions || '',
                paymentMethod: body.paymentMethod,
                paymentSlipUrl: body.paymentSlipUrl || '',
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            
            // 保存到模拟数据库
            registrations.push(registration);
            console.log('注册成功，当前注册人数:', registrations.length);
            
            // 返回模拟响应
            return new Response(
                JSON.stringify({
                    success: true,
                    message: '注册成功',
                    registration: registration
                }),
                { 
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        } catch (error) {
            console.error('处理注册请求时出错:', error);
            return new Response(
                JSON.stringify({
                    success: false,
                    message: '处理注册请求时出错: ' + error.message
                }),
                { 
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
    }
    
    console.log('模拟API响应处理程序已初始化');
})();