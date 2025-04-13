class RemoveClassListFromItems < ActiveRecord::Migration[8.0]
  def change
    remove_column :items, :class_list, :string
  end
end
