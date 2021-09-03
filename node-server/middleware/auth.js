const jwt = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");
// const axios = require("axios");

// protect routes
exports.protect = async (req, res, next) => {
  var token = req.get("Authorization");
  if (!token) {
    const error = new Error("No Token Sent in Auth Header");
    error.statusCode = 401;
    throw error;
  }

  this.validateToken(token, (err, payload) => {
    if (err) {
      res.status(403).json({
        msg: `You are not authorized to access this resource`,
      });
    } else {
      // continue on to the users controller
      // req.user_id = user_id; // set user_id in the request object
      req.payload = payload;
      next();
    }
  });
};

// this is ncs cognito user pool public keys, we need to be able to make an async request to get the json
// from this url: https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xin9uKNC7/.well-known/jwks.json
// its currently not working in lambda
// const jwkJson2 = {
//   keys: [
//     {
//       alg: "RS256",
//       e: "AQAB",
//       kid: "DNkrPicYs5bntvoI55qOWYrHXTbWYUcF15I+X+/f17k=",
//       kty: "RSA",
//       n:
//         "rEuAh0JPrrCdxHHTADTkOmCcyBZ0xyEsHWQuQlroYOUBL0dilJWbtoclXPQEA9CUeg8HVZ3g3u4Phj1VJfML_Hk7yl07MPdFARUPrSYFN3MaUqA4NOIQQMW7vNE3UfKlIMQ8w3uAQYXzSRGNGG9w63t2X2CeccEaak9T09sJ-zWctdGjO69qPO0rohuL_Si7Q3iNNwYE5fq-fbRRqZfz3ZTAphvP5vh0sdIzazGP_YOelNsgTxDAOFZ97-pmWhEaIoJZIZkdcd5_qxu43h-3V8xXa8oE8dHuCMlTkIrhNG3qSSrP0_T47V8VtKHqd7y0pgvGaw-vRCi15bxxi-E3uQ",
//       use: "sig",
//     },
//     {
//       alg: "RS256",
//       e: "AQAB",
//       kid: "WsNqIAOShUHrKjOaOowP/l90cLwyQPq4KgthqQ8nhwE=",
//       kty: "RSA",
//       n:
//         "yX5ntIATCm2kVyKP30zCtfLq3a7T6fi0X3TRfdTcVOuRVSlAUQhcwpcZOF95961ldftavvjuDJHLRtXd0QYJl52HIGWlaMrX_2Y6GdBI3_68RZZsyjMn92qaDfwWi5hjAtwJa0G93FIINTg6hfujvZzqPtWTE2NOcyxSUv085i2YDnsHrdlvJuk49tBpvNlYgR49zN3dbYRSlozaqWdL0mO3H5RFVvLRV4dwKjU8J-7jeUB1y69ZBIkVpEudxySEp-mr-yIBmhgbzL6bj62p8uw5HLTv_D9Ot5cbAek0nmQ4XbbKxyFpVMwykTu6cScuDmTp5wk86uS7mfN1rzI8ww",
//       use: "sig",
//     },
//   ],
// };
jwt_public = {
  keys: [
    {
      kty: "RSA",
      use: "sig",
      kid: "nOo3ZDrODXEK1jKWhXslHR_KXEg",
      x5t: "nOo3ZDrODXEK1jKWhXslHR_KXEg",
      n:
        "oaLLT9hkcSj2tGfZsjbu7Xz1Krs0qEicXPmEsJKOBQHauZ_kRM1HdEkgOJbUznUspE6xOuOSXjlzErqBxXAu4SCvcvVOCYG2v9G3-uIrLF5dstD0sYHBo1VomtKxzF90Vslrkn6rNQgUGIWgvuQTxm1uRklYFPEcTIRw0LnYknzJ06GC9ljKR617wABVrZNkBuDgQKj37qcyxoaxIGdxEcmVFZXJyrxDgdXh9owRmZn6LIJlGjZ9m59emfuwnBnsIQG7DirJwe9SXrLXnexRQWqyzCdkYaOqkpKrsjuxUj2-MHX31FqsdpJJsOAvYXGOYBKJRjhGrGdONVrZdUdTBQ",
      e: "AQAB",
      x5c: [
        "MIIDBTCCAe2gAwIBAgIQN33ROaIJ6bJBWDCxtmJEbjANBgkqhkiG9w0BAQsFADAtMSswKQYDVQQDEyJhY2NvdW50cy5hY2Nlc3Njb250cm9sLndpbmRvd3MubmV0MB4XDTIwMTIyMTIwNTAxN1oXDTI1MTIyMDIwNTAxN1owLTErMCkGA1UEAxMiYWNjb3VudHMuYWNjZXNzY29udHJvbC53aW5kb3dzLm5ldDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKGiy0/YZHEo9rRn2bI27u189Sq7NKhInFz5hLCSjgUB2rmf5ETNR3RJIDiW1M51LKROsTrjkl45cxK6gcVwLuEgr3L1TgmBtr/Rt/riKyxeXbLQ9LGBwaNVaJrSscxfdFbJa5J+qzUIFBiFoL7kE8ZtbkZJWBTxHEyEcNC52JJ8ydOhgvZYykete8AAVa2TZAbg4ECo9+6nMsaGsSBncRHJlRWVycq8Q4HV4faMEZmZ+iyCZRo2fZufXpn7sJwZ7CEBuw4qycHvUl6y153sUUFqsswnZGGjqpKSq7I7sVI9vjB199RarHaSSbDgL2FxjmASiUY4RqxnTjVa2XVHUwUCAwEAAaMhMB8wHQYDVR0OBBYEFI5mN5ftHloEDVNoIa8sQs7kJAeTMA0GCSqGSIb3DQEBCwUAA4IBAQBnaGnojxNgnV4+TCPZ9br4ox1nRn9tzY8b5pwKTW2McJTe0yEvrHyaItK8KbmeKJOBvASf+QwHkp+F2BAXzRiTl4Z+gNFQULPzsQWpmKlz6fIWhc7ksgpTkMK6AaTbwWYTfmpKnQw/KJm/6rboLDWYyKFpQcStu67RZ+aRvQz68Ev2ga5JsXlcOJ3gP/lE5WC1S0rjfabzdMOGP8qZQhXk4wBOgtFBaisDnbjV5pcIrjRPlhoCxvKgC/290nZ9/DLBH3TbHk8xwHXeBAnAjyAqOZij92uksAv7ZLq4MODcnQshVINXwsYshG1pQqOLwMertNaY5WtrubMRku44Dw7R",
      ],
      issuer: "https://login.microsoftonline.com/{tenantid}/v2.0",
    },
    {
      kty: "RSA",
      use: "sig",
      kid: "l3sQ-50cCH4xBVZLHTGwnSR7680",
      x5t: "l3sQ-50cCH4xBVZLHTGwnSR7680",
      n:
        "sfsXMXWuO-dniLaIELa3Pyqz9Y_rWff_AVrCAnFSdPHa8__Pmkbt_yq-6Z3u1o4gjRpKWnrjxIh8zDn1Z1RS26nkKcNg5xfWxR2K8CPbSbY8gMrp_4pZn7tgrEmoLMkwfgYaVC-4MiFEo1P2gd9mCdgIICaNeYkG1bIPTnaqquTM5KfT971MpuOVOdM1ysiejdcNDvEb7v284PYZkw2imwqiBY3FR0sVG7jgKUotFvhd7TR5WsA20GS_6ZIkUUlLUbG_rXWGl0YjZLS_Uf4q8Hbo7u-7MaFn8B69F6YaFdDlXm_A0SpedVFWQFGzMsp43_6vEzjfrFDJVAYkwb6xUQ",
      e: "AQAB",
      x5c: [
        "MIIDBTCCAe2gAwIBAgIQWPB1ofOpA7FFlOBk5iPaNTANBgkqhkiG9w0BAQsFADAtMSswKQYDVQQDEyJhY2NvdW50cy5hY2Nlc3Njb250cm9sLndpbmRvd3MubmV0MB4XDTIxMDIwNzE3MDAzOVoXDTI2MDIwNjE3MDAzOVowLTErMCkGA1UEAxMiYWNjb3VudHMuYWNjZXNzY29udHJvbC53aW5kb3dzLm5ldDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALH7FzF1rjvnZ4i2iBC2tz8qs/WP61n3/wFawgJxUnTx2vP/z5pG7f8qvumd7taOII0aSlp648SIfMw59WdUUtup5CnDYOcX1sUdivAj20m2PIDK6f+KWZ+7YKxJqCzJMH4GGlQvuDIhRKNT9oHfZgnYCCAmjXmJBtWyD052qqrkzOSn0/e9TKbjlTnTNcrIno3XDQ7xG+79vOD2GZMNopsKogWNxUdLFRu44ClKLRb4Xe00eVrANtBkv+mSJFFJS1Gxv611hpdGI2S0v1H+KvB26O7vuzGhZ/AevRemGhXQ5V5vwNEqXnVRVkBRszLKeN/+rxM436xQyVQGJMG+sVECAwEAAaMhMB8wHQYDVR0OBBYEFLlRBSxxgmNPObCFrl+hSsbcvRkcMA0GCSqGSIb3DQEBCwUAA4IBAQB+UQFTNs6BUY3AIGkS2ZRuZgJsNEr/ZEM4aCs2domd2Oqj7+5iWsnPh5CugFnI4nd+ZLgKVHSD6acQ27we+eNY6gxfpQCY1fiN/uKOOsA0If8IbPdBEhtPerRgPJFXLHaYVqD8UYDo5KNCcoB4Kh8nvCWRGPUUHPRqp7AnAcVrcbiXA/bmMCnFWuNNahcaAKiJTxYlKDaDIiPN35yECYbDj0PBWJUxobrvj5I275jbikkp8QSLYnSU/v7dMDUbxSLfZ7zsTuaF2Qx+L62PsYTwLzIFX3M8EMSQ6h68TupFTi5n0M2yIXQgoRoNEDWNJZ/aZMY/gqT02GQGBWrh+/vJ",
      ],
      issuer: "https://login.microsoftonline.com/{tenantid}/v2.0",
    },
    {
      kty: "RSA",
      use: "sig",
      kid: "DqUu8gf-nAgcyjP3-SuplNAXAnc",
      x5t: "DqUu8gf-nAgcyjP3-SuplNAXAnc",
      n:
        "1n7-nWSLeuWQzBRlYSbS8RjvWvkQeD7QL9fOWaGXbW73VNGH0YipZisPClFv6GzwfWECTWQp19WFe_lASka5-KEWkQVzCbEMaaafOIs7hC61P5cGgw7dhuW4s7f6ZYGZEzQ4F5rHE-YNRbvD51qirPNzKHk3nji1wrh0YtbPPIf--NbI98bCwLLh9avedOmqESzWOGECEMXv8LSM-B9SKg_4QuBtyBwwIakTuqo84swTBM5w8PdhpWZZDtPgH87Wz-_WjWvk99AjXl7l8pWPQJiKNujt_ck3NDFpzaLEppodhUsID0ptRA008eCU6l8T-ux19wZmb_yBnHcV3pFWhQ",
      e: "AQAB",
      x5c: [
        "MIIC8TCCAdmgAwIBAgIQYVk/tJ1e4phISvVrAALNKTANBgkqhkiG9w0BAQsFADAjMSEwHwYDVQQDExhsb2dpbi5taWNyb3NvZnRvbmxpbmUudXMwHhcNMjAxMjIxMDAwMDAwWhcNMjUxMjIxMDAwMDAwWjAjMSEwHwYDVQQDExhsb2dpbi5taWNyb3NvZnRvbmxpbmUudXMwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDWfv6dZIt65ZDMFGVhJtLxGO9a+RB4PtAv185ZoZdtbvdU0YfRiKlmKw8KUW/obPB9YQJNZCnX1YV7+UBKRrn4oRaRBXMJsQxppp84izuELrU/lwaDDt2G5bizt/plgZkTNDgXmscT5g1Fu8PnWqKs83MoeTeeOLXCuHRi1s88h/741sj3xsLAsuH1q9506aoRLNY4YQIQxe/wtIz4H1IqD/hC4G3IHDAhqRO6qjzizBMEznDw92GlZlkO0+AfztbP79aNa+T30CNeXuXylY9AmIo26O39yTc0MWnNosSmmh2FSwgPSm1EDTTx4JTqXxP67HX3BmZv/IGcdxXekVaFAgMBAAGjITAfMB0GA1UdDgQWBBQ2r//lgTPcKughDkzmCtRlw+P9SzANBgkqhkiG9w0BAQsFAAOCAQEAsFdRyczNWh/qpYvcIZbDvWYzlrmFZc6blcUzns9zf7sUWtQZrZPu5DbetV2Gr2r3qtMDKXCUaR+pqoy3I2zxTX3x8bTNhZD9YAgAFlTLNSydTaK5RHyB/5kr6B7ZJeNIk3PRVhRGt6ybCJSjV/VYVkLR5fdLP+5GhvBESobAR/d0ntriTzp7/tLMb/oXx7w5Hu1m3I8rpMocoXfH2SH1GLmMXj6Mx1dtwCDYM6bsb3fhWRz9O9OMR6QNiTnq8q9wn1QzBAnRcswYzT1LKKBPNFSasCvLYOCPOZCL+W8N8jqa9ZRYNYKWXzmiSptgBEM24t3m5FUWzWqoLu9pIcnkPQ==",
      ],
      issuer: "https://login.microsoftonline.com/{tenantid}/v2.0",
    },
    {
      kty: "RSA",
      use: "sig",
      kid: "OzZ5Dbmcso9Qzt2ModGmihg30Bo",
      x5t: "OzZ5Dbmcso9Qzt2ModGmihg30Bo",
      n:
        "01re9a2BUTtNtdFzLNI-QEHW8XhDiDMDbGMkxHRIYXH41zBccsXwH9vMi0HuxXHpXOzwtUYKwl93ZR37tp6lpvwlU1HePNmZpJ9D-XAvU73x03YKoZEdaFB39VsVyLih3fuPv6DPE2qT-TNE3X5YdIWOGFrcMkcXLsjO-BCq4qcSdBH2lBgEQUuD6nqreLZsg-gPzSDhjVScIUZGiD8M2sKxADiIHo5KlaZIyu32t8JkavP9jM7ItSAjzig1W2yvVQzUQZA-xZqJo2jxB3g_fygdPUHK6UN-_cqkrfxn2-VWH1wMhlm90SpxTMD4HoYOViz1ggH8GCX2aBiX5OzQ6Q",
      e: "AQAB",
      x5c: [
        "MIIC8TCCAdmgAwIBAgIQQrXPXIlUE4JMTMkVj+02YTANBgkqhkiG9w0BAQsFADAjMSEwHwYDVQQDExhsb2dpbi5taWNyb3NvZnRvbmxpbmUudXMwHhcNMjEwMzEwMDAwMDAwWhcNMjYwMzEwMDAwMDAwWjAjMSEwHwYDVQQDExhsb2dpbi5taWNyb3NvZnRvbmxpbmUudXMwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDTWt71rYFRO0210XMs0j5AQdbxeEOIMwNsYyTEdEhhcfjXMFxyxfAf28yLQe7Fcelc7PC1RgrCX3dlHfu2nqWm/CVTUd482Zmkn0P5cC9TvfHTdgqhkR1oUHf1WxXIuKHd+4+/oM8TapP5M0Tdflh0hY4YWtwyRxcuyM74EKripxJ0EfaUGARBS4Pqeqt4tmyD6A/NIOGNVJwhRkaIPwzawrEAOIgejkqVpkjK7fa3wmRq8/2Mzsi1ICPOKDVbbK9VDNRBkD7FmomjaPEHeD9/KB09QcrpQ379yqSt/Gfb5VYfXAyGWb3RKnFMwPgehg5WLPWCAfwYJfZoGJfk7NDpAgMBAAGjITAfMB0GA1UdDgQWBBTECjBRANDPLGrn1p7qtwswtBU7JzANBgkqhkiG9w0BAQsFAAOCAQEAq1Ib4ERvXG5kiVmhfLOpun2ElVOLY+XkvVlyVjq35rZmSIGxgfFc08QOQFVmrWQYrlss0LbboH0cIKiD6+rVoZTMWxGEicOcGNFzrkcG0ulu0cghKYID3GKDTftYKEPkvu2vQmueqa4t2tT3PlYF7Fi2dboR5Y96Ugs8zqNwdBMRm677N/tJBk53CsOf9NnBaxZ1EGArmEHHIb80vODStv35ueLrfMRtCF/HcgkGxy2U8kaCzYmmzHh4zYDkeCwM3Cq2bGkG+Efe9hFYfDHw13DzTR+h9pPqFFiAxnZ3ofT96NrZHdYjwbfmM8cw3ldg0xQzGcwZjtyYmwJ6sDdRvQ==",
      ],
      issuer: "https://login.microsoftonline.com/{tenantid}/v2.0",
    },
    {
      kty: "RSA",
      use: "sig",
      kid: "1LTMzakihiRla_8z2BEJVXeWMqo",
      x5t: "1LTMzakihiRla_8z2BEJVXeWMqo",
      n:
        "3sKcJSD4cHwTY5jYm5lNEzqk3wON1CaARO5EoWIQt5u-X-ZnW61CiRZpWpfhKwRYU153td5R8p-AJDWT-NcEJ0MHU3KiuIEPmbgJpS7qkyURuHRucDM2lO4L4XfIlvizQrlyJnJcd09uLErZEO9PcvKiDHoois2B4fGj7CsAe5UZgExJvACDlsQSku2JUyDmZUZP2_u_gCuqNJM5o0hW7FKRI3MFoYCsqSEmHnnumuJ2jF0RHDRWQpodhlAR6uKLoiWHqHO3aG7scxYMj5cMzkpe1Kq_Dm5yyHkMCSJ_JaRhwymFfV_SWkqd3n-WVZT0ADLEq0RNi9tqZ43noUnO_w",
      e: "AQAB",
      x5c: [
        "MIIDYDCCAkigAwIBAgIJAIB4jVVJ3BeuMA0GCSqGSIb3DQEBCwUAMCkxJzAlBgNVBAMTHkxpdmUgSUQgU1RTIFNpZ25pbmcgUHVibGljIEtleTAeFw0xNjA0MDUxNDQzMzVaFw0yMTA0MDQxNDQzMzVaMCkxJzAlBgNVBAMTHkxpdmUgSUQgU1RTIFNpZ25pbmcgUHVibGljIEtleTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAN7CnCUg+HB8E2OY2JuZTRM6pN8DjdQmgETuRKFiELebvl/mZ1utQokWaVqX4SsEWFNed7XeUfKfgCQ1k/jXBCdDB1NyoriBD5m4CaUu6pMlEbh0bnAzNpTuC+F3yJb4s0K5ciZyXHdPbixK2RDvT3Lyogx6KIrNgeHxo+wrAHuVGYBMSbwAg5bEEpLtiVMg5mVGT9v7v4ArqjSTOaNIVuxSkSNzBaGArKkhJh557pridoxdERw0VkKaHYZQEerii6Ilh6hzt2hu7HMWDI+XDM5KXtSqvw5ucsh5DAkifyWkYcMphX1f0lpKnd5/llWU9AAyxKtETYvbameN56FJzv8CAwEAAaOBijCBhzAdBgNVHQ4EFgQU9IdLLpbC2S8Wn1MCXsdtFac9SRYwWQYDVR0jBFIwUIAU9IdLLpbC2S8Wn1MCXsdtFac9SRahLaQrMCkxJzAlBgNVBAMTHkxpdmUgSUQgU1RTIFNpZ25pbmcgUHVibGljIEtleYIJAIB4jVVJ3BeuMAsGA1UdDwQEAwIBxjANBgkqhkiG9w0BAQsFAAOCAQEAXk0sQAib0PGqvwELTlflQEKS++vqpWYPW/2gCVCn5shbyP1J7z1nT8kE/ZDVdl3LvGgTMfdDHaRF5ie5NjkTHmVOKbbHaWpTwUFbYAFBJGnx+s/9XSdmNmW9GlUjdpd6lCZxsI6888r0ptBgKINRRrkwMlq3jD1U0kv4JlsIhafUIOqGi4+hIDXBlY0F/HJPfUU75N885/r4CCxKhmfh3PBM35XOch/NGC67fLjqLN+TIWLoxnvil9m3jRjqOA9u50JUeDGZABIYIMcAdLpI2lcfru4wXcYXuQul22nAR7yOyGKNOKULoOTE4t4AeGRqCogXSxZgaTgKSBhvhE+MGg==",
      ],
      issuer:
        "https://login.microsoftonline.com/9188040d-6c67-4c5b-b112-36a304b66dad/v2.0",
    },
    {
      kty: "RSA",
      use: "sig",
      kid: "bW8ZcMjBCnJZS-ibX5UQDNStvx4",
      x5t: "bW8ZcMjBCnJZS-ibX5UQDNStvx4",
      n:
        "2a70SwgqIh8U-Shj_VJJGBheEVk2F4ygmMCRtKUAb1jMP6R1j5Mc5xaqhgzlWjckJI1lx4rha1oNLrdg8tJBxdm8V8xZohCOanJ52uAwoc6FFTY3VRLaUZSJ3zCXfuJwy4KvFHJUAuLhLj0hVeq-y10CmRJ1_MPTuNRJLdblSWcXyWYIikIRggQWS04M-QjR7571mX-Lu_eDs8xJVrnNFMVGRmFqf3EFD4QLNjW9JJj0m_prnTv41V_E8AA7MQZ12ip3u5aeOAQqGjVyzdHxvV9laxta6XWaM8QSTIu_Zav1-aDYExp99nCP4Hw0_Oom5vK5N88DB8VM0mouQi8a8Q",
      e: "AQAB",
      x5c: [
        "MIIDYDCCAkigAwIBAgIJAN2X7t+ckntxMA0GCSqGSIb3DQEBCwUAMCkxJzAlBgNVBAMTHkxpdmUgSUQgU1RTIFNpZ25pbmcgUHVibGljIEtleTAeFw0yMTAzMjkyMzM4MzNaFw0yNjAzMjgyMzM4MzNaMCkxJzAlBgNVBAMTHkxpdmUgSUQgU1RTIFNpZ25pbmcgUHVibGljIEtleTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANmu9EsIKiIfFPkoY/1SSRgYXhFZNheMoJjAkbSlAG9YzD+kdY+THOcWqoYM5Vo3JCSNZceK4WtaDS63YPLSQcXZvFfMWaIQjmpyedrgMKHOhRU2N1US2lGUid8wl37icMuCrxRyVALi4S49IVXqvstdApkSdfzD07jUSS3W5UlnF8lmCIpCEYIEFktODPkI0e+e9Zl/i7v3g7PMSVa5zRTFRkZhan9xBQ+ECzY1vSSY9Jv6a507+NVfxPAAOzEGddoqd7uWnjgEKho1cs3R8b1fZWsbWul1mjPEEkyLv2Wr9fmg2BMaffZwj+B8NPzqJubyuTfPAwfFTNJqLkIvGvECAwEAAaOBijCBhzAdBgNVHQ4EFgQU57BsETnF8TctGU87R4N9YxmNWoIwWQYDVR0jBFIwUIAU57BsETnF8TctGU87R4N9YxmNWoKhLaQrMCkxJzAlBgNVBAMTHkxpdmUgSUQgU1RTIFNpZ25pbmcgUHVibGljIEtleYIJAN2X7t+ckntxMAsGA1UdDwQEAwIBxjANBgkqhkiG9w0BAQsFAAOCAQEAcsk+LGlTzSQdnh3mtCBMNCGZCiTYvFcqenwjDf1/c4U+Yi7fxYmAXm7wVLX+GVMxpLPpzMuVOXztGoPMUgWH59CFWhsMvZbIUKsd8xbEKmls1ZIgxRYdagcWTGeBET6XIoF6Ba57BhRCxFPslhIpg27/HnfHtTdGfjRpafNbBYvC/9PL/s2E9U4AklpUn2W19UiJLRFgXGPjYPLW0j1Od0qzHHJ84saclVwvuOrpp75Y+0Du5Z2OrjNF1W4dEWZMJmmOe73ejAnoiWJI25kQpkd4ooNasw3HIZEJZ6cKctmPJLdvx0tJ8bde4DivtWOeFIwcAkokH2jlHmAOipNETw==",
      ],
      issuer:
        "https://login.microsoftonline.com/9188040d-6c67-4c5b-b112-36a304b66dad/v2.0",
    },
  ],
};

exports.validateToken = async function(token, callback) {
  async function getjwkJson() {
    // url for below for our cognito user pool
    const res = await axios.get(
      "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xin9uKNC7/.well-known/jwks.json"
    );
    return res.data;
  }
  const jwkJson = jwt_public;
  const pems = {};
  var keys = jwkJson["keys"];
  for (var i = 0; i < keys.length; i++) {
    const key_id = keys[i].kid;
    const modulus = keys[i].n;
    const exponent = keys[i].e;
    const key_type = keys[i].kty;
    const jwk = { kty: key_type, n: modulus, e: exponent };
    let pem = jwkToPem(jwk);
    pems[key_id] = pem;
  }
  var decodedJwt = jwt.decode(token, { complete: true });
  if (!decodedJwt) {
    console.log("Not a valid JWT token");
    callback(new Error("Not a valid JWT token"));
    return;
  }
  let kid = decodedJwt.header.kid;
  pem = pems[kid];
  if (!pem) {
    console.log("Invalid token");
    callback(new Error("Invalid token"));
    return;
  }
  jwt.verify(token, pem, function(err, payload) {
    if (err) {
      console.log("Invalid Token.");
      callback(new Error("Invalid token"));
      return;
    } else {
      callback(null, payload);
    }
  });
};
