exports.getPublic = async (req, res, next) => {
  //   const area_id = req.params.id;
  //   const response = await anonymousAreasModel.get(area_id);
  res.status(200).json({
    success: true,
    data: {
      testData: [09, 78, 4542],
      msg:
        "This data is coming from a nodeJs server hosted on AWS. We are not verifying the users id. This endpoint is open to the public.",
    },
  });
};

exports.getPrivate = async (req, res, next) => {
  //   const area_id = req.params.id;
  //   const response = await anonymousAreasModel.get(area_id);
  const payload = req.payload;
  const name = req.payload.given_name + req.payload.family_name;
  const email = req.payload.verified_primary_email;

  res.status(200).json({
    success: true,
    data: {
      Name: name,
      email: email,
      msg:
        "This data is coming from a NodeJs server after the users IdToken is verified. IdToken is verfied using a jwt public and private key, exp datetime, and matching aud values. The process is documented here: https://nicksnettravels.builttoroam.com/post-2017-01-24-verifying-azure-active-directory-jwt-tokens-aspx/",
    },
  });
};
