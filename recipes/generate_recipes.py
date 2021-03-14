import os 
import bs4 as Soup

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
    
def main():
    file_list = build_recipe_list('./recipe_notes')
    parsed_files = []

    for recipe_file in file_list:
        parsed_files.append(parse_file(recipe_file))

    sorted_recipes = []
    for recipe in parsed_files:
        sorted_recipes.append(sort_recipe(recipe)) 
        
    # for sorted_recipe in sorted_recipes:
    # NEXT - SORT OUT EXAMPLE HTML PAGE, THEN CONVERT TO HTML
    for rec in sorted_recipes:
        print(rec)

if __name__ == "__main__":
    main()