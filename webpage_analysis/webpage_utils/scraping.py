import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import base64
import bs4

def read_webpage(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.text


def read_webpage_with_links(url):
    html_code = read_webpage(url)

    soup = bs4.BeautifulSoup(html_code, 'html.parser')
    links = [a['href'] for a in soup.find_all('a', href=True)]
    for link in links:
        if link.startswith("/"):
            link = url + link
        try:
            page_code = read_webpage(link)
            html_code += f"\n\nLink: {link}, html content: {page_code}"
        except:
            pass
    return html_code

def render_and_screenshot(url):
    options = Options()
    options.headless = True
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    
    # Connect to the remote Selenium server
    driver = webdriver.Remote(
        command_executor='http://localhost:4444/wd/hub',
        options=options
    )
    driver.get(url)
    driver.save_screenshot('webpage_screenshot.png')
    driver.quit()

# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")