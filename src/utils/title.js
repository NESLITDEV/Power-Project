const APP_NAME = "Power Auto";

export const setDocumentTitle = (pageTitle) => {
  document.title = pageTitle ? `${pageTitle} | ${APP_NAME}` : APP_NAME;
};

export const resetDocumentTitle = () => {
  document.title = APP_NAME;
};
