def download
  # cd source/images/posts
  images = `findc ../../_posts image |grep imgur`.split
  images = images.map do |image|
    image.match(/\!\[image\]\((.+)\)/)[1]
  end
  images.each do |image|
    `wget #{image}`
  end
end

def replace
  # sed -i "" -e "s/\!\[image\](http:\/\/i.imgur.com\/\(.*\))/{% img \/images\/posts\/\1 %}/g" ./*.markdown
end
