  // console.log(req.query)
// console.log(req.body)
 // request.post({
 //            url: 'https://api.intra.42.fr/oauth/token',
 //            json: true,
 //            body: {
 //                code: req.body.code,
 //                grant_type: 'client_credentials',
 //                client_id: 'eef7d6d152278701ce7c395d702828ebadcde1ca4856d591557a3d2f7426dba7',
 //                client_secret: '104f776aba57b4ef41b852395c06d12c98149011efa7fb0cd30562bc93714279',
 //                redirect_uri: 'http://localhost:8080/oauth42'
 //            }
 //        }, function (error, response, body){
 //            if (error)
 //                console.log(error);
 //            else if (response.body.error) 
 //                console.log(response.body.error);
 //            // console.log(response)
 //            token = response.body.access_token;
 //             console.log(token)
 //            request.get({
 //                url: 'https://api.intra.42.fr/v2/me?access_token=' + token,
 //                json: true
 //            }, function (error, response, body){
 //                    if (error)
 //                        console.log(error)
 //                    else if (response.body.error)
 //                         console.log(response.body.error)
 //                    console.log(body)
 //                    res.render('login.ejs')
 //                })
 //        });


const connectUDF = () => (
    new Promise((resolve, reject) => {
        request.post({
            url: 'https://api.intra.42.fr/oauth/token',
            json: true,
            body: {
                code: req.body.code,
                grant_type: 'client_credentials',
                client_id: 'eef7d6d152278701ce7c395d702828ebadcde1ca4856d591557a3d2f7426dba7',
                client_secret: '104f776aba57b4ef41b852395c06d12c98149011efa7fb0cd30562bc93714279',
                redirect_uri: 'http://localhost:8080/oauth42'
            }
        }, (error, response, body) => {
            if (error)
                resolve(error);
            else if (response.body.error) 
                resovle(response.body.error);
            // console.log(response)
            token = response.body.access_token;
             console.log(token)
            request.get({
                url: 'https://api.intra.42.fr/v2/me?access_token=' + token,
                json: true
            }, function (error, response, body){
                    if (error)
                        console.log(error)
                    else if (response.body.error)
                         console.log(response.body.error)
                    resolve(body)
                })
        });
    })
)

connectUDF().then(result => {
    console.log(result)
    res.render('login.ejs')
})

// var headers = {
//         'Accept' : 'application/json',
//         'User-Agent':       'Super Agent/0.0.1',
//         'Content-Type':     'application/x-www-form-urlencoded'
//     }
//     var options = {
//         url: 'https://api.intra.42.fr/oauth/token',
//         method: 'POST',
//         headers: headers,
//         form: { 'client_id': 'eef7d6d152278701ce7c395d702828ebadcde1ca4856d591557a3d2f7426dba7', 
//         'redirect_uri': 'http://localhost:8080/oauth',
//         'client_secret' : '104f776aba57b4ef41b852395c06d12c98149011efa7fb0cd30562bc93714279', 'grant_type' : 'client_credentials'}
//     }
//     request.post(options, function (error, response, body) {
// console.log(response.statusCode)
//         if (!error && response.statusCode == 200) {
//             body = JSON.parse(body)
            
//             var options = {
//                 url: 'https://api.intra.42.fr/v2/me',
//                 qs: {access_token: body.access_token},
//             }

//             request(options, function (error2, response2, body2) {
//                 if (!error && response.statusCode == 200) {
//                     var bodyy2 = JSON.parse(body2)
//                     console.log(body2)
//                     // req.session.profile = body;
//                     // req.session.profile.img = body.avatar_url;
//                     res.render('index.ejs', {profile:req.session.profile, success:"Success login with your 42 account"})
//                 }
//                 else
//     				res.render('index.ejs', {error:"something went wrong"})
//             })
//     	}
//     	else
//     		res.render('index.ejs', {error:"something went wrong"})
// 	});