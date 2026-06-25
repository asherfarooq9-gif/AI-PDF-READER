from pypdf import PdfReader  # imports PDF reader library

def load_pdf(file_path):  # function takes path of PDF file
    reader = PdfReader(file_path)  # opens the PDF file

    text = ""  # empty string to store extracted text

    for page in reader.pages:  # loop through each page
        content = page.extract_text()  # extract text from page

        if content:  # check if page has text
            text += content  # add page text to final result

    return text  # return full PDF text