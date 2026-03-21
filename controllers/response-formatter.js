function formatResponse(res, {contentType, statusCode, body, headers}) {
  const formattedResponse = {
    statusCode: statusCode,
    headers: headers ? headers : {},
  };
  if (body instanceof Error) {
    formattedResponse.body = {
      message: body.message,
      name: body.name,
      code: body.errorCode,
    };
    formattedResponse.headers['content-type'] = 'application/json';
  } else {
    formattedResponse.body = {Data:body};
    formattedResponse.headers['content-type'] = contentType ? contentType : 'application/json';
  }
  
  res.set(formattedResponse.headers);
  return res.status(formattedResponse.statusCode).send(formattedResponse.body);
}

function formatError(res, {error}) {
  return formatResponse(res, {
    statusCode: error.httpStatusCode || 500, // Fallback to 500 if httpStatusCode is not defined
    body: {
      message: error.message,
      name: error.name,
      code: error.errorCode,
    },
  });
}

module.exports = {formatResponse, formatError};