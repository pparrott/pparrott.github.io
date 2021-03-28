import os 
import re 
from bs4 import BeautifulSoup

def build_recipe_list(folder):
    '''Generates file locations of recipes present in the pwd'''
    file_list = []
    for filename in os.listdir(folder):
        if filename != "00_template.txt":
            file_list.append(folder + '/' + filename)
    
    return file_list

def parse_file(file):
    '''Reads a file into a list, with each line of the file as a string'''
    with open(file) as f:
        return [line.strip() for line in f]


def sort_recipe(recipe):
    '''Sorts a recipe into a list of tuples'''
    def return_index(recipe, mark):
        '''Returns an index of -1 if not able to be found'''
        try:
            mark_index = recipe.index(mark)
        except ValueError:
            mark_index = -1
        return mark_index
    
    marks = {
        # add headings as needed
        'Preparation': return_index(recipe, 'Preparation'), 
        'Ingredients': return_index(recipe, 'Ingredients'), 
        'Notes': return_index(recipe, 'Notes') 
    } 
    ranked_marks = sorted(marks, key=marks.get)
    
    sorted_recipe = [('Title', recipe[0])]
    for idx, mark in enumerate(ranked_marks):
        if marks[mark] == -1:
            continue
        elif idx+1 < len(marks):
            sorted_recipe.append((mark, recipe[marks[mark] + 1: marks[ranked_marks[idx+1]]]))
        else:
            sorted_recipe.append((mark, recipe[marks[mark] + 1:]))
            
    return sorted_recipe

def write_html_recipe(recipe):
    def import_html_template(html_loc):
        with open(html_loc) as html_doc:
            return BeautifulSoup(html_doc, 'html.parser')

    def write_title(heading, contents):
        for title_loc in soup.select('.Title'):
            title_loc.string = contents
        return  

    def write_ordered_list(heading, contents):
        write_list(heading, contents, 'ol')
        return 

    def write_unordered_list(heading, contents):
        write_list(heading, contents, 'ul')
        return
    
    def write_list(heading, contents, list_type):
        html_heading = soup.new_tag("h2")
        html_heading.string = heading 
        insertion_point.insert_before(html_heading)

        list_start = soup.new_tag(list_type)
        html_heading.insert_after(list_start)

        for content in contents:
            content_tag = soup.new_tag('li')
            content_tag.string = content
            list_start.append(content_tag)
        return  

    soup = import_html_template('recipe_template.html')
    insertion_point = soup.select('.Placeholder')[0]

    function_map = {
        'Title': write_title,
        'Preparation': write_ordered_list,
        'Ingredients': write_unordered_list,
        'Notes': write_unordered_list
    }

    for heading, contents in recipe:
        function_map[heading](heading, contents)

    insertion_point.decompose()
    return soup

def write_to_file(html_title, html_recipe):
    string_data = html_recipe.prettify()
    file_title = re.sub(r"[^a-zA-Z]+", "", html_title).lower()

    with open(f'{file_title}_recipe.html', 'w') as f:
        f.write(string_data)

def main():
    file_list = build_recipe_list('./recipe_notes')
    
    parsed_files = []
    for recipe_file in file_list:
        parsed_files.append(parse_file(recipe_file))

    sorted_recipes = []
    for recipe in parsed_files:
        sorted_recipes.append(sort_recipe(recipe)) 

    html_files = {}
    for sorted_recipe in sorted_recipes:
        recipe_title = sorted_recipe[0][1]
        html_files[recipe_title] = write_html_recipe(sorted_recipe)
    
    for html_file in html_files:
        write_to_file(html_file, html_files[html_file])

    return

if __name__ == "__main__":
    main()