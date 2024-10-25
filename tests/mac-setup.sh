set -e

# Create venv and install requirements
python3 -m venv venv;
source venv/bin/activate;
pip install -r requirements.txt;

# Install necessary node packages
jlpm install

# Install playwright. If the user provides a browser, install only that browser
# Otherwise, install all browsers. This is primarily used so that the CI can
# install only the necessary browsers.
if [ $# -eq 0 ]
  then
    npx playwright install chromium webkit firefox || echo "Warning: Failed to install some browsers"
    npx playwright install chrome || echo "Warning: Failed to install Chrome"
  else
    npx playwright install $1 || echo "Warning: Failed to install specified browser"
    npx playwright install || echo "Warning: Failed to install additional browsers"
fi

# Install mitosheet
cd ../mitosheet

# Install Python dependencies
pip install -e ".[test]"

# Install the npm dependences for Mitosheet, and build JS
jlpm install
jlpm run build