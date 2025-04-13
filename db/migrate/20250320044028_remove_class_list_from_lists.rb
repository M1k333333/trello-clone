class RemoveClassListFromLists < ActiveRecord::Migration[8.0]
  def change
    remove_column :lists, :class_list, :string
  end
end
