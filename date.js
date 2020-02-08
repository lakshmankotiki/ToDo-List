//creating custom module to get the formatted date and use it anywhere
const getDate = function() {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    const date = new Date();
    const language = process.LANG;
    const formattedDate = date.toLocaleDateString(language, options)
    return formattedDate;
};

module.exports = getDate;